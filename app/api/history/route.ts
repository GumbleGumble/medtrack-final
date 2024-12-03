import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"
import { z } from "zod"
import { getTimeOfDay } from "@/lib/date-utils"
import { Prisma } from "@prisma/client"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const querySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  medicationIds: z.string().optional().transform((str) => str?.split(",").filter(Boolean) || []),
  groupIds: z.string().optional().transform((str) => str?.split(",").filter(Boolean) || []),
  includeSkipped: z.string().transform((str) => str === "true"),
  status: z.enum(["taken", "skipped", "all"]).optional().default("all"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night", "all"]).optional().default("all"),
  search: z.string().optional(),
  page: z.string().transform((str) => parseInt(str) || 1),
  limit: z.string().transform((str) => parseInt(str) || 10),
  sortField: z.enum(["timestamp", "medicationName", "dosage", "status"]).optional().default("timestamp"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    // Generate cache key based on query parameters and user
    const cacheKey = `history:${session.user.id}:${JSON.stringify(query)}`

    // Try to get data from cache
    const cachedData = await redis.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Build where clause for medications
    const medicationWhere: Prisma.MedicationWhereInput = {
      group: {
        user: {
          primaryEmail: session.user.email,
        },
        ...(query.groupIds.length > 0 ? { id: { in: query.groupIds } } : {}),
      },
      ...(query.medicationIds.length > 0 ? { id: { in: query.medicationIds } } : {}),
      ...(query.search ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as Prisma.QueryMode } },
          { group: { name: { contains: query.search, mode: 'insensitive' as Prisma.QueryMode } } },
        ],
      } : {}),
    }

    // Build where clause for dose records
    const doseWhere: Prisma.DoseRecordWhereInput = {
      medication: medicationWhere,
      timestamp: {
        gte: query.startDate,
        lte: query.endDate,
      },
      ...(query.status !== "all" ? { skipped: query.status === "skipped" } : {}),
    }

    // Add time of day filter
    if (query.timeOfDay !== "all") {
      const startHour = getTimeRangeHours(query.timeOfDay)[0]
      const endHour = getTimeRangeHours(query.timeOfDay)[1]
      
      doseWhere.AND = [{
        timestamp: {
          gte: query.startDate,
          lte: query.endDate,
        },
        OR: [
          {
            AND: [
              { timestamp: { gte: new Date(query.startDate.setHours(startHour, 0, 0)) } },
              { timestamp: { lt: new Date(query.startDate.setHours(endHour, 0, 0)) } },
            ],
          },
        ],
      }]
    }

    // Count total records for pagination
    const totalDoses = await prisma.doseRecord.count({
      where: doseWhere,
    })

    // Calculate pagination
    const skip = (query.page - 1) * query.limit
    const totalPages = Math.ceil(totalDoses / query.limit)

    // Fetch paginated and sorted records
    const doses = await prisma.doseRecord.findMany({
      where: doseWhere,
      include: {
        medication: {
          include: {
            group: {
              select: {
                name: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: getSortOrder(query.sortField, query.sortDirection),
      skip,
      take: query.limit,
    })

    const response = {
      doses,
      total: totalDoses,
      page: query.page,
      totalPages,
    }

    // Cache the results for 5 minutes
    await redis.set(cacheKey, response, { ex: 300 })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid query parameters", { status: 400 })
    }
    console.error("History fetch error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

function getTimeRangeHours(timeOfDay: string): [number, number] {
  switch (timeOfDay) {
    case 'morning':
      return [5, 12]
    case 'afternoon':
      return [12, 17]
    case 'evening':
      return [17, 21]
    case 'night':
      return [21, 5]
    default:
      return [0, 24]
  }
}

function getSortOrder(field: string, direction: 'asc' | 'desc'): Prisma.DoseRecordOrderByWithRelationInput {
  switch (field) {
    case 'medicationName':
      return { medication: { name: direction } }
    case 'status':
      return { skipped: direction }
    default:
      return { [field]: direction }
  }
} 