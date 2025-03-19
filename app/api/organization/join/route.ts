import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function POST(request: Request) {
    try {
        let session;
        try {
            session = await auth();
        } catch (error: unknown) {
            console.error("Authentication error:", getErrorMessage(error));
            return NextResponse.json(
                { error: "Authentication error" },
                { status: 500 }
            );
        }

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { code } = await request.json();
        console.log(code)
        if (!code) {
            return NextResponse.json(
                { error: "Invite code is required" },
                { status: 400 }
            );
        }

        const invite = await prisma.invite.findUnique({
            where: { code },
            include: { organization: true },
        });

        if (!invite) {
            return NextResponse.json(
                { error: "Invalid invite code" },
                { status: 404 }
            );
        }
        if (invite.used) {
            return NextResponse.json(
                { error: "Invite code has already been used" },
                { status: 400 }
            );
        }
        if (new Date(invite.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: "Invite code has expired" },
                { status: 400 }
            );
        }

        await prisma.userOrganization.create({
            data: {
                userId: session.user.id,
                organizationId: invite.organizationId,
                role: invite.role,
            },
        });

        await prisma.invite.update({
            where: { id: invite.id },
            data: { used: true },
        });

        return NextResponse.json(
            {
                message: "Successfully joined the organization",
                organization: invite.organization,
            },
            { status: 200 }
        );
    } catch {
        console.error("Error joining organization:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request" },
            { status: 500 }
        );
    }
}
