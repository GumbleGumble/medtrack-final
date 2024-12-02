import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/medications/:path*",
    "/stats/:path*",
    "/settings/:path*",
  ],
}