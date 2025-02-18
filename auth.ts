import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/schema";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
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
                        console.log(user);
                        return user as any;
                    }
                } catch (error) {
                    console.log("Error during auth", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
});
