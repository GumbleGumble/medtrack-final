import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const preferencesSchema = z.object({
  theme: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderTime: z.number().min(0).max(23).optional(),
  reminderBuffer: z.number().min(0).max(60).optional(),
  soundEnabled: z.boolean().optional(),
  vibrationEnabled: z.boolean().optional(),
  colorScheme: z.string().optional(),
  fontSize: z.string().optional(),
  useHighContrast: z.boolean().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = preferencesSchema.parse(json)

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        ...body,
        userId: session.user.id,
      },
      update: body,
    })

    return NextResponse.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 