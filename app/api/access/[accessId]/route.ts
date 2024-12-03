import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { accessId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify access grant belongs to user
    const access = await prisma.userAccess.findFirst({
      where: {
        id: params.accessId,
        OR: [
          { grantedById: session.user.id },
          { grantedToId: session.user.id },
        ],
      },
    })

    if (!access) {
      return new NextResponse("Access grant not found", { status: 404 })
    }

    // Delete the access grant
    await prisma.userAccess.delete({
      where: { id: params.accessId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 