import { hashPassword } from "@/lib/hashing"
import { prisma } from "@/lib/prisma"
import { signInSchema } from "@/lib/schema"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter,
    providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedCredentials = signInSchema.parse(credentials)

        // logic to salt and hash password
        const pwHash = hashPassword(validatedCredentials.password);

        const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.email , password: pwHash },
        });

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.")
        }

        // return user object with their profile data
        return user
      },
    }),
  ],
})
