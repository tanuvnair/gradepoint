import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "User not authenticated" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: "Email already verified" },
                { status: 400 }
            );
        }

        // Delete any existing verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { identifier: user.email },
        });

        // Generate new verification token
        const token = uuidv4();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store verification token
        await prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token,
                expires,
            },
        });

        // Send verification email
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

        const data = await resend.emails.send({
            from: "GradePoint <noreply@gradepoint.vunat.in>",
            to: user.email,
            subject: "Verify your email address",
            html: `
                <div style="
                    background-color: hsl(171, 69%, 95%);
                    color: hsl(171, 5%, 4%);
                    padding: 2rem;
                    border-radius: 0.75rem;
                    font-family: 'Inter', sans-serif;
                    max-width: 500px;
                    margin: auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid hsl(171, 30%, 50%);
                ">
                    <h1 style="color: hsl(171, 60%, 23%); font-size: 1.5rem; text-align: center;">
                        Verify Your Email Address
                    </h1>
                    <p style="font-size: 1rem; margin-top: 1rem;">
                        Please verify your email address to complete your registration.
                    </p>
                    <div style="
                        background-color: hsl(171, 50%, 90%);
                        color: hsl(171, 5%, 10%);
                        padding: 1rem;
                        border-radius: 0.75rem;
                        margin-top: 1rem;
                        text-align: center;
                    ">
                        <a href="${verificationUrl}" style="
                            display: inline-block;
                            background-color: hsl(171, 60%, 23%);
                            color: hsl(0, 0%, 100%);
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.75rem;
                            text-decoration: none;
                            font-weight: bold;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        ">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: hsl(171, 5%, 40%);">
                        This link will expire in 24 hours.
                    </p>
                </div>
            `,
        });

        return NextResponse.json(
            {
                message: "Verification email sent",
                data
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error sending verification email:", error.message);
            return NextResponse.json(
                {
                    message: "Failed to send verification email",
                    details: error.message
                },
                { status: 500 }
            );
        }

        console.error("Unknown error:", error);
        return NextResponse.json(
            {
                message: "Failed to send verification email",
                details: "An unknown error occurred",
            },
            { status: 500 }
        );
    }
}
