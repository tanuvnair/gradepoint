import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function DELETE(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const { organizationId } = params;

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
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
                { error: "You don't have permission to remove users" },
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

        // Prevent removing the owner
        if (targetUser.role === "OWNER") {
            return NextResponse.json(
                { error: "Cannot remove the organization owner" },
                { status: 403 }
            );
        }

        // Remove the user from the organization
        await prisma.userOrganization.delete({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId,
                },
            },
        });

        // If the removed user is the current user, find another organization they belong to
        if (userId === session.user.id) {
            const otherOrganization = await prisma.userOrganization.findFirst({
                where: { userId: session.user.id },
                include: { organization: true },
            });

            // Return a redirect response
            return new NextResponse(null, {
                status: 302,
                headers: {
                    'Location': otherOrganization
                        ? `/organization/${otherOrganization.organizationId}/dashboard`
                        : '/organization'
                }
            });
        }

        return NextResponse.json({
            message: "User removed successfully",
            isSelfRemoval: false
        }, { status: 200 });
    } catch (error) {
        console.error("Error removing user:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Failed to remove user" },
            { status: 500 }
        );
    }
}
