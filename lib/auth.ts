import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions, Session, User } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { Adapter, AdapterUser } from "next-auth/adapters"
import { createTransport, TransportOptions } from "nodemailer"

interface VerificationRequest {
  identifier: string
  url: string
  token?: string
  provider?: {
    server: TransportOptions
    from: string
  }
}

interface UserData extends Partial<AdapterUser> {
  email: string
  emailVerified?: Date | null
  name?: string | null
}

interface EmailServerConfig {
  host: string
  port: number
  auth: {
    user: string
    pass: string
  }
}

interface EmailParams {
  identifier: string
  url: string
}

const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },
} as TransportOptions

const transporter = createTransport(emailConfig)

const customAdapter: Adapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: UserData): Promise<AdapterUser> => {
    const user = await prisma.user.create({
      data: {
        primaryEmail: data.email,
        email: data.email,
        emailVerified: data.emailVerified,
        name: data.name,
        preferences: {
          create: {
            theme: 'system',
            emailNotifications: true,
            pushNotifications: false
          }
        }
      }
    })
    
    const adapterUser: AdapterUser = {
      id: user.id,
      email: user.primaryEmail,
      emailVerified: user.emailVerified,
      name: user.name
    }

    return adapterUser
  }
}

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  providers: [
    EmailProvider({
      server: emailConfig,
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier, url }: EmailParams): Promise<void> {
        try {
          await transporter.sendMail({
            to: identifier,
            subject: "Sign in to MedTracker",
            text: `Click here to sign in: ${url}`,
            html: `
              <div>
                <h1>Sign in to MedTracker</h1>
                <p>Click the link below to sign in:</p>
                <a href="${url}">Sign in</a>
              </div>
            `,
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
    session: async ({ session, user }: { session: Session; user: User }): Promise<Session> => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}