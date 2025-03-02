import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Create organization
export async function POST(req: Request) {
    const logs = [];

    try {
        logs.push("Request received");

        // Parse request body
        let requestBody;
        try {
            requestBody = await req.json();
            logs.push(`Request body parsed: ${JSON.stringify(requestBody)}`);
        } catch (error) {
            logs.push(`Error parsing request body: ${error.message}`);
            return NextResponse.json(
                { error: "Invalid request body", logs },
                { status: 400 }
            );
        }

        const { name } = requestBody;
        logs.push(`Organization name: ${name}`);

        if (!name) {
            logs.push("Missing required field: name");
            return NextResponse.json(
                { error: "Name is required", logs },
                { status: 400 }
            );
        }

        // Check authentication
        let session;
        try {
            session = await auth();
            logs.push(`Session retrieved: ${JSON.stringify(session)}`);
        } catch (error) {
            logs.push(`Error getting session: ${error.message}`);
            return NextResponse.json(
                { error: "Authentication error", logs },
                { status: 500 }
            );
        }

        if (!session?.user?.id) {
            logs.push("No authenticated user found");
            return NextResponse.json(
                { error: "Unauthorized", logs },
                { status: 401 }
            );
        }

        logs.push(`User ID: ${session.user.id}`);

        // Database operations
        let organization;
        try {
            logs.push("Creating organization...");
            organization = await prisma.organization.create({
                data: {
                    name,
                    ownerId: session.user.id,
                },
            });
            logs.push(`Organization created: ${JSON.stringify(organization)}`);
        } catch (error) {
            logs.push(`Error creating organization: ${error.message}`);
            return NextResponse.json(
                { error: "Failed to create organization", details: error.message, logs },
                { status: 500 }
            );
        }

        try {
            logs.push("Creating user organization relation...");
            const userOrg = await prisma.userOrganization.create({
                data: {
                    userId: session.user.id,
                    organizationId: organization.id,
                    role: "OWNER"
                },
            });
            logs.push(`UserOrganization created: ${JSON.stringify(userOrg)}`);
        } catch (error) {
            logs.push(`Error creating user organization relation: ${error.message}`);

            // Attempt to roll back the organization creation
            try {
                logs.push(`Attempting to delete organization ${organization.id} due to failed user relation...`);
                await prisma.organization.delete({
                    where: { id: organization.id }
                });
                logs.push("Organization deleted successfully");
            } catch (rollbackError) {
                logs.push(`Failed to roll back organization: ${rollbackError.message}`);
            }

            return NextResponse.json(
                { error: "Failed to create user organization relation", details: error.message, logs },
                { status: 500 }
            );
        }

        logs.push("Operation completed successfully");
        return NextResponse.json({
            success: true,
            organization,
            logs
        }, { status: 201 });

    } catch (error) {
        logs.push(`Unexpected error: ${error.message}`);
        return NextResponse.json(
            { error: "Failed to process request", details: error.message, logs },
            { status: 500 }
        );
    }
}
