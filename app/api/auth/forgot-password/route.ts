import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        console.log("Processing password reset request for email:", email);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("No user found with email:", email);
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json(
                { message: "If an account exists with that email, you will receive a password reset link." },
                { status: 200 }
            );
        }

        // Generate reset token
        const token = uuidv4();
        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        // Store reset token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        // Send reset email
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        console.log("Sending reset email to:", email);
        console.log("Reset URL:", resetUrl);

        const emailResponse = await resend.emails.send({
            from: "GradePoint <noreply@gradepoint.vunat.in>",
            to: email,
            subject: "Reset your GradePoint password",
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
                        Reset Your Password
                    </h1>
                    <p style="font-size: 1rem; margin-top: 1rem;">
                        We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    <div style="
                        background-color: hsl(171, 50%, 90%);
                        color: hsl(171, 5%, 10%);
                        padding: 1rem;
                        border-radius: 0.75rem;
                        margin-top: 1rem;
                        text-align: center;
                    ">
                        <a href="${resetUrl}" style="
                            display: inline-block;
                            background-color: hsl(171, 60%, 23%);
                            color: hsl(0, 0%, 100%);
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.75rem;
                            text-decoration: none;
                            font-weight: bold;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        ">
                            Reset Password
                        </a>
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: hsl(171, 5%, 40%);">
                        This link will expire in 1 hour.
                    </p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: hsl(171, 5%, 40%);">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        console.log("Email sent successfully:", emailResponse);

        return NextResponse.json(
            { message: "If an account exists with that email, you will receive a password reset link." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in forgot password:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
