import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createDoseRecord } from "@/lib/utils/medication"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const doseRecord = await createDoseRecord({
      ...body,
      recordedByUserId: session.user.id,
    })
    return NextResponse.json(doseRecord)
  } catch (error) {
    console.error("Failed to create dose record:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}