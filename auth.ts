import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/schema";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter,
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                let user = null;

                const { email, password } = await signInSchema.parseAsync(
                    credentials
                );

                try {
                    user = await prisma.user.findUnique({
                        where: {
                            email: email,
                        },
                    });

                    if (!user) {
                        return null;
                    }

                    if (
                        user &&
                        (await bcrypt.compare(
                            password,
                            user.password as string
                        ))
                    ) {
                        return user
                    }
                } catch (error) {
                    console.log("Error during auth", error);
                    return null;
                }
            },
        }),
    ],
});
