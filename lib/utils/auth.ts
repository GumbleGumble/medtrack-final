import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  return session.user
}

export async function getUserAccess(userId: string) {
  return prisma.userAccess.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { grantedUserId: userId },
      ],
    },
    include: {
      owner: true,
      grantedUser: true,
    },
  })
}