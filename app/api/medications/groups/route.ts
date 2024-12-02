import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getMedicationGroups } from "@/lib/utils/medication"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const groups = await getMedicationGroups(session.user.id)
    return NextResponse.json(groups)
  } catch (error) {
    console.error("Failed to fetch medication groups:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Get the highest display order
    const lastGroup = await prisma.medicationGroup.findFirst({
      where: { userId: session.user.id },
      orderBy: { displayOrder: 'desc' },
    })
    
    const displayOrder = lastGroup ? lastGroup.displayOrder + 1 : 0

    const group = await prisma.medicationGroup.create({
      data: {
        name: body.name,
        color: body.color,
        icon: body.icon,
        userId: session.user.id,
        displayOrder,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Failed to create medication group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}