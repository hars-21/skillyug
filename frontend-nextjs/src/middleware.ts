import { auth } from "@/lib/auth"

export default auth((req) => {
  // Add any middleware logic here if needed
  // For now, just let NextAuth handle authentication
})

export const config = {
  // Specify which routes this middleware should run on
  matcher: [
    // Match all request paths except static files and API routes that don't need auth
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo|Pics).*)',
  ]
}