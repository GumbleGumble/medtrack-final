import { PrismaAdapter } from "@prisma/client/runtime/library"
import { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "./prisma"
import { Resend } from 'resend'
import { render } from '@react-email/render'
import VerificationEmail from "@/components/emails/verification-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        const emailHtml = await render(VerificationEmail({ url }))
        
        try {
          await resend.emails.send({
            from: `MedTrack <${process.env.EMAIL_FROM!}>`,
            to: identifier,
            subject: "Verify your email for MedTrack",
            html: emailHtml,
          })
        } catch (error) {
          console.error('Failed to send verification email:', error)
          throw new Error('Failed to send verification email')
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        
        // Get user preferences and access grants
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            emailVerified: true,
            accessGranted: true,
            accessOwned: true,
          },
        })
        
        if (user) {
          session.user.emailVerified = user.emailVerified
          session.user.accessGranted = user.accessGranted
          session.user.accessOwned = user.accessOwned
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.emailVerified = user.emailVerified
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      // Create default preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      })
    },
  },
}