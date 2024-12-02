import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { startOfDay, subDays, format } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const endDate = new Date()
    const startDate = subDays(endDate, 7)

    const records = await prisma.doseRecord.findMany({
      where: {
        medication: {
          group: {
            userId: session.user.id,
          },
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const stats = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(endDate, i)
      const dayStart = startOfDay(date)
      const dayRecords = records.filter(record => 
        startOfDay(new Date(record.timestamp)).getTime() === dayStart.getTime()
      )

      return {
        date: format(date, "MMM d"),
        taken: dayRecords.filter(r => !r.skipped).length,
        skipped: dayRecords.filter(r => r.skipped).length,
      }
    }).reverse()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch statistics:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}