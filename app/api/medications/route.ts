import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  unit: z.string().min(1),
  frequency: z.string().min(1),
  groupId: z.string().min(1),
  isAsNeeded: z.boolean(),
  minTimeBetweenDoses: z.number().nullable(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = medicationSchema.parse(json)

    // Verify group belongs to user
    const group = await prisma.medicationGroup.findFirst({
      where: {
        id: body.groupId,
        user: {
          primaryEmail: session.user.email,
        },
      },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    const medication = await prisma.medication.create({
      data: {
        ...body,
        group: {
          connect: { id: body.groupId },
        },
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const medications = await prisma.medication.findMany({
      where: {
        group: {
          user: {
            primaryEmail: session.user.email,
          },
        },
      },
      include: {
        doseRecords: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    })

    return NextResponse.json(medications)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}