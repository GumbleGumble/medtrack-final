import { DefaultSession, DefaultUser } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser, AdapterUser {
    primaryEmail: string
    emailVerified?: Date | null
    name?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
  }
}