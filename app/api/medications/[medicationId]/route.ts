import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  isAsNeeded: z.boolean().optional(),
  minTimeBetweenDoses: z.number().nullable().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = updateMedicationSchema.parse(json)

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

    const updatedMedication = await prisma.medication.update({
      where: { id: params.medicationId },
      data: body,
    })

    return NextResponse.json(updatedMedication)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

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

    // Delete all dose records first
    await prisma.doseRecord.deleteMany({
      where: { medicationId: params.medicationId },
    })

    // Then delete the medication
    await prisma.medication.delete({
      where: { id: params.medicationId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 