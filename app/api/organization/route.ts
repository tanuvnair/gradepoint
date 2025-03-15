import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function POST(req: Request) {
    try {
        console.log("Received request to create organization");

        let requestBody;
        try {
            requestBody = await req.json();
            console.log("Request body:", requestBody);
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

        const { icon, name } = requestBody;
        if (!name) {
            console.error("Name is required");
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        let session;
        try {
            session = await auth();
            console.log("Authenticated user:", session?.user);
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
            console.error("Unauthorized: No user ID found in session");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        try {
            console.log("Checking for existing organization with name:", name);
            const existingOrganization = await prisma.organization.findFirst({
                where: {
                    name,
                },
            });

            if (existingOrganization) {
                console.error(
                    "Organization with this name already exists:",
                    existingOrganization
                );
                return NextResponse.json(
                    { error: "An organization with this name already exists" },
                    { status: 409 }
                );
            }
        } catch (error: unknown) {
            console.error(
                "Error checking for existing organization:",
                getErrorMessage(error)
            );
            return NextResponse.json(
                { error: "Failed to check for existing organization" },
                { status: 500 }
            );
        }

        let organization;
        try {
            console.log(
                "Creating organization with name:",
                name,
                "and icon:",
                icon
            );
            organization = await prisma.organization.create({
                data: {
                    name,
                    icon: icon as string,
                    ownerId: session.user.id,
                },
            });
            console.log("Organization created successfully:", organization);
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
            console.log(
                "Creating user-organization relationship for user:",
                session.user.id,
                "and organization:",
                organization.id
            );
            await prisma.userOrganization.create({
                data: {
                    userId: session.user.id,
                    organizationId: organization.id,
                    role: "OWNER",
                },
            });
            console.log("User-organization relationship created successfully");
        } catch (error: unknown) {
            console.error(
                "Error creating user organization relation:",
                getErrorMessage(error)
            );
            try {
                console.log("Attempting to rollback organization creation");
                await prisma.organization.delete({
                    where: { id: organization.id },
                });
                console.log("Organization rollback successful");
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

        console.log("Organization creation process completed successfully");
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
