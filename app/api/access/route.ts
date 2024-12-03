import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Resend } from 'resend'
import { render } from '@react-email/render'
import VerificationEmail from "@/components/emails/verification-email"

const resend = new Resend(process.env.RESEND_API_KEY)

const grantAccessSchema = z.object({
  email: z.string().email(),
  groupIds: z.array(z.string()),
  canEdit: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { email, groupIds, canEdit } = grantAccessSchema.parse(json)

    // Verify all groups belong to the user
    const groups = await prisma.medicationGroup.findMany({
      where: {
        id: { in: groupIds },
        user: {
          primaryEmail: session.user.email,
        },
      },
    })

    if (groups.length !== groupIds.length) {
      return new NextResponse("Invalid group IDs", { status: 400 })
    }

    // Find or create the user being granted access
    let grantedUser = await prisma.user.findUnique({
      where: { primaryEmail: email },
    })

    if (!grantedUser) {
      // Create new user if they don't exist
      grantedUser = await prisma.user.create({
        data: { primaryEmail: email },
      })

      // Send invitation email
      const verificationUrl = new URL('/auth/signin', process.env.NEXTAUTH_URL)
      const emailHtml = render(VerificationEmail({ 
        url: verificationUrl.toString(),
        appName: "MedTrack - Medication Access Invitation"
      }))

      await resend.emails.send({
        from: `MedTrack <${process.env.EMAIL_FROM!}>`,
        to: email,
        subject: "You've been granted access to medications on MedTrack",
        html: emailHtml,
      })
    }

    // Create access grants
    const accessGrants = await Promise.all(
      groupIds.map((groupId) =>
        prisma.userAccess.create({
          data: {
            grantedById: session.user.id,
            grantedToId: grantedUser!.id,
            groupId,
            canEdit,
          },
        })
      )
    )

    return NextResponse.json(accessGrants)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const accessGrants = await prisma.userAccess.findMany({
      where: {
        OR: [
          { grantedById: session.user.id },
          { grantedToId: session.user.id },
        ],
      },
      include: {
        grantedBy: {
          select: {
            primaryEmail: true,
          },
        },
        grantedTo: {
          select: {
            primaryEmail: true,
          },
        },
        group: true,
      },
    })

    return NextResponse.json(accessGrants)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 