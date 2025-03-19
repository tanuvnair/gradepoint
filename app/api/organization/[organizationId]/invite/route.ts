import { auth } from "@/auth";
import { Invite, Organization, PrismaClient, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();

interface InviteRequest {
    email: string;
    role: Role;
}

interface AppError extends Error {
    status?: number;
    details?: string;
}

export async function POST(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    const { organizationId } = await params;

    let session;
    try {
        session = await auth();
    } catch (error) {
        const err = error as AppError;
        console.error("Authentication error:", err.message);
        return NextResponse.json(
            { error: "Authentication error", details: err.details },
            { status: err.status || 500 }
        );
    }

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { email, role }: InviteRequest = await request.json();

        if (!email || !role) {
            return NextResponse.json(
                { error: "email and role are required" },
                { status: 400 }
            );
        }

        const organization: Organization | null = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // Example: "ABC123"

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite: Invite = await prisma.invite.create({
            data: {
                code,
                organizationId,
                role,
                expiresAt,
            },
        });

        const data = await resend.emails.send({
            from: "no-reply@gradepoint.vunat.in",
            to: email,
            subject: `Invitation to join ${organization.name}`,
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
                        Invitation to Join ${organization.name}
                    </h1>
                    <p style="font-size: 1rem; margin-top: 1rem;">
                        You have been invited to join <strong>${organization.name}</strong> as ${role === "STUDENT" ? "a" : "an"} <strong>${role.toLowerCase()}</strong>
                    </p>
                    <div style="
                        background-color: hsl(171, 50%, 90%);
                        color: hsl(171, 5%, 10%);
                        padding: 1rem;
                        border-radius: 0.75rem;
                        margin-top: 1rem;
                        text-align: center;
                        font-weight: bold;
                        font-size: 1.25rem;
                    ">
                        ${code}
                    </div>
                    <p style="margin-top: 1rem;">
                        This code will expire on <strong>${expiresAt.toDateString()}</strong>.
                    </p>
                    <div style="margin-top: 1.5rem; text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="
                            display: inline-block;
                            background-color: hsl(171, 60%, 23%);
                            color: hsl(0, 0%, 100%);
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.75rem;
                            text-decoration: none;
                            font-weight: bold;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        ">
                            Go To GradePoint
                        </a>
                    </div>
                </div>
            `,
        });


        return NextResponse.json(
            { message: "Email sent successfully", invite, data },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error sending email:", error.message);
            return NextResponse.json(
                { error: "Failed to send email", details: error.message },
                { status: 500 }
            );
        }

        console.error("Unknown error:", error);
        return NextResponse.json(
            {
                error: "Failed to send email",
                details: "An unknown error occurred",
            },
            { status: 500 }
        );
    }
}
