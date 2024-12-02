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
    const { email } = await req.json()

    const access = await prisma.userAccess.create({
      data: {
        email,
        status: "PENDING",
        ownerId: session.user.id,
      },
    })

    // TODO: Send invitation email
    
    return NextResponse.json(access)
  } catch (error) {
    console.error("Failed to create access invitation:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}