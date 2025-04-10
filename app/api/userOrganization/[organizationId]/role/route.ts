import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function PATCH(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const { organizationId } = params;

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, newRole } = await request.json();
        if (!userId || !newRole) {
            return NextResponse.json(
                { error: "userId and newRole are required" },
                { status: 400 }
            );
        }

        // Check if the requesting user is an admin or owner
        const requestingUser = await prisma.userOrganization.findFirst({
            where: {
                userId: session.user.id,
                organizationId: organizationId,
            },
        });

        if (!requestingUser || (requestingUser.role !== "ADMIN" && requestingUser.role !== "OWNER")) {
            return NextResponse.json(
                { error: "You don't have permission to change roles" },
                { status: 403 }
            );
        }

        // Check if the target user exists in the organization
        const targetUser = await prisma.userOrganization.findFirst({
            where: {
                userId: userId,
                organizationId: organizationId,
            },
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: "User not found in organization" },
                { status: 404 }
            );
        }

        // Prevent changing owner's role
        if (targetUser.role === "OWNER") {
            return NextResponse.json(
                { error: "Cannot change owner's role" },
                { status: 403 }
            );
        }

        // Update the user's role
        const updatedUser = await prisma.userOrganization.update({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId,
                },
            },
            data: {
                role: newRole,
            },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating user role:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Failed to update user role" },
            { status: 500 }
        );
    }
}
