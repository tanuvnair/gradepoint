import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        // Find the verification token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token,
                expires: {
                    gt: new Date(), // Check if token is not expired
                },
            },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 400 }
            );
        }

        // Update user's email verification status
        await prisma.user.update({
            where: {
                email: verificationToken.identifier,
            },
            data: {
                emailVerified: new Date(),
            },
        });

        // Delete the used verification token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                },
            },
        });

        return NextResponse.json(
            { message: "Email verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json(
            { message: "Failed to verify email" },
            { status: 500 }
        );
    }
}
