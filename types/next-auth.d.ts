import { UserAccess } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    primaryEmail: string
    emailVerified?: Date | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      emailVerified?: Date | null
      accessGranted?: UserAccess[]
      accessOwned?: UserAccess[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    emailVerified?: Date | null
  }
}