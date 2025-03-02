import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function POST(req: Request) {
    try {
        let requestBody;
        try {
            requestBody = await req.json();
        } catch (error: unknown) {
            console.error(
                "Error parsing request body:",
                getErrorMessage(error)
            );
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { icon, name  } = requestBody;
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        let session;
        try {
            session = await auth();
        } catch (error: unknown) {
            console.error(
                "Error during authentication:",
                getErrorMessage(error)
            );
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

        let organization;
        try {
            organization = await prisma.organization.create({
                data: {
                    name,
                    icon: icon as string,
                    ownerId: session.user.id,
                },
            });
        } catch (error: unknown) {
            console.error(
                "Error creating organization:",
                getErrorMessage(error)
            );
            return NextResponse.json(
                { error: "Failed to create organization" },
                { status: 500 }
            );
        }

        try {
            await prisma.userOrganization.create({
                data: {
                    userId: session.user.id,
                    organizationId: organization.id,
                    role: "OWNER",
                },
            });
        } catch (error: unknown) {
            console.error(
                "Error creating user organization relation:",
                getErrorMessage(error)
            );
            try {
                await prisma.organization.delete({
                    where: { id: organization.id },
                });
            } catch (rollbackError: unknown) {
                console.error(
                    "Failed to rollback organization:",
                    getErrorMessage(rollbackError)
                );
            }
            return NextResponse.json(
                { error: "Failed to create user organization relation" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, organization },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Unexpected error:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}

export async function GET() {
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

        const memberships = await prisma.userOrganization.findMany({
            where: { userId: session.user.id },
            include: { organization: true },
        });

        const organizations = memberships.map(
            (memberships) => memberships.organization
        );

        return NextResponse.json(
            { success: true, organizations },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Unexpected error:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Failed to retrieve organizations" },
            { status: 500 }
        );
    }
}
