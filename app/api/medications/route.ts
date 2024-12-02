import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Verify group belongs to user
    const group = await prisma.medicationGroup.findFirst({
      where: {
        id: body.groupId,
        userId: session.user.id,
      },
    })

    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }

    const medication = await prisma.medication.create({
      data: {
        name: body.name,
        groupId: body.groupId,
        dosage: body.dosage,
        unit: body.unit,
        frequency: body.frequency,
        isAsNeeded: body.isAsNeeded,
        minTimeBetweenDoses: body.minTimeBetweenDoses,
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error("Failed to create medication:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}