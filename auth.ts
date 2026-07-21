// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Google,
//   ],
// });
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const pathname = request.nextUrl.pathname

      // Login aur authentication routes ko public rakho
      if (pathname === '/login' || pathname.startsWith('/api/auth')) {
        return true
      }

      // Baaki routes ke liye login required hai
      return isLoggedIn
    },
  },
})