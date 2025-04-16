import { hashPassword } from "@/lib/hashing";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        // Find the verification token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token,
                expires: {
                    gt: new Date(), // Token hasn't expired
                },
            },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { message: "Invalid or expired reset link" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);

        // Update the user's password
        await prisma.user.update({
            where: {
                email: verificationToken.identifier,
            },
            data: {
                password: hashedPassword,
            },
        });

        // Delete the used token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                },
            },
        });

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in reset password:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
