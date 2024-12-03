import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const doseRecordSchema = z.object({
  timestamp: z.string().or(z.date()),
  notes: z.string().optional(),
  skipped: z.boolean().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = doseRecordSchema.parse(json)

    // Verify medication belongs to user
    const medication = await prisma.medication.findFirst({
      where: {
        id: params.medicationId,
        group: {
          user: {
            primaryEmail: session.user.email,
          },
        },
      },
    })

    if (!medication) {
      return new NextResponse("Medication not found", { status: 404 })
    }

    // Check minimum time between doses if applicable
    if (medication.minTimeBetweenDoses) {
      const lastDose = await prisma.doseRecord.findFirst({
        where: {
          medicationId: medication.id,
          skipped: false,
        },
        orderBy: {
          timestamp: 'desc',
        },
      })

      if (lastDose) {
        const timeSinceLastDose = 
          new Date(body.timestamp).getTime() - new Date(lastDose.timestamp).getTime()
        const minTimeInMs = medication.minTimeBetweenDoses * 60 * 1000

        if (timeSinceLastDose < minTimeInMs) {
          return new NextResponse(
            "Minimum time between doses not elapsed",
            { status: 400 }
          )
        }
      }
    }

    const doseRecord = await prisma.doseRecord.create({
      data: {
        ...body,
        medication: {
          connect: { id: medication.id },
        },
      },
    })

    return NextResponse.json(doseRecord)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const medication = await prisma.medication.findFirst({
      where: {
        id: params.medicationId,
        group: {
          user: {
            primaryEmail: session.user.email,
          },
        },
      },
    })

    if (!medication) {
      return new NextResponse("Medication not found", { status: 404 })
    }

    const doseRecords = await prisma.doseRecord.findMany({
      where: {
        medicationId: medication.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return NextResponse.json(doseRecords)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 