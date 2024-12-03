import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { z } from "zod"
import { Parser } from "@json2csv/plainjs"

const exportSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  medicationIds: z.array(z.string()),
  includeSkipped: z.boolean(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const query = exportSchema.parse(body)

    const medications = await prisma.medication.findMany({
      where: {
        group: {
          user: {
            primaryEmail: session.user.email,
          },
        },
        ...(query.medicationIds.length > 0
          ? { id: { in: query.medicationIds } }
          : {}),
      },
      include: {
        doseRecords: {
          where: {
            timestamp: {
              gte: query.startDate,
              lte: query.endDate,
            },
            ...(query.includeSkipped ? {} : { skipped: false }),
          },
          orderBy: {
            timestamp: "desc",
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    })

    // Transform data for CSV export
    const exportData = medications.flatMap((med) =>
      med.doseRecords.map((dose) => ({
        Date: format(new Date(dose.timestamp), "yyyy-MM-dd"),
        Time: format(new Date(dose.timestamp), "HH:mm:ss"),
        "Medication Name": med.name,
        "Medication Group": med.group.name,
        Dosage: `${med.dosage} ${med.unit}`,
        Status: dose.skipped ? "Skipped" : "Taken",
        Notes: dose.notes || "",
      }))
    )

    // Generate CSV
    const parser = new Parser({
      fields: [
        "Date",
        "Time",
        "Medication Name",
        "Medication Group",
        "Dosage",
        "Status",
        "Notes",
      ],
    })
    const csv = parser.parse(exportData)

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="medication-history-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.csv"`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    console.error("Export error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 