import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    const { organizationId } = await params;

    let session;
    try {
        session = await auth();
        console.log("Authenticated user:", session?.user);
    } catch (error: unknown) {
        console.error("Error during authentication:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Authentication error" },
            { status: 500 }
        );
    }

    if (!session?.user?.id) {
        console.error("Unauthorized: No user ID found in session");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name } = await request.json();
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Invalid organization name" },
                { status: 400 }
            );
        }

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                {
                    error: "Forbidden: You do not have permission to edit this organization",
                },
                { status: 403 }
            );
        }

        const updatedOrganization = await prisma.organization.update({
            where: { id: organizationId },
            data: { name },
        });

        return NextResponse.json(updatedOrganization, { status: 200 });
    } catch (error: unknown) {
        console.error("Error updating organization:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    const { organizationId } = await params;

    let session;
    try {
        session = await auth();
        console.log("Authenticated user:", session?.user);
    } catch (error: unknown) {
        console.error("Error during authentication:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Authentication error" },
            { status: 500 }
        );
    }

    if (!session?.user?.id) {
        console.error("Unauthorized: No user ID found in session");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const organizationInfo = await prisma.userOrganization.findMany({
            where: { organizationId: organizationId, userId: session.user.id },
            include: { organization: true },
        });

        if (!organizationInfo || organizationInfo[0].role !== "OWNER") {
            await prisma.userOrganization.delete({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: organizationId,
                    },
                },
            });
        } else {
            await prisma.$transaction([
                prisma.invite.deleteMany({ where: { organizationId } }),
                prisma.exam.deleteMany({ where: { organizationId } }),
                prisma.userOrganization.deleteMany({ where: { organizationId } }),
                prisma.organization.delete({ where: { id: organizationId } }),
            ]);
        }



        const otherOrganization = await prisma.userOrganization.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        });

        return NextResponse.json({
            message: "Organization deleted successfully",
            redirectTo: otherOrganization
                ? otherOrganization.organizationId
                : null,
        });
    } catch (error: unknown) {
        console.error(
            "Failed to delete organization: ",
            getErrorMessage(error)
        );
        return NextResponse.json(
            { error: "Failed to delete organization" },
            { status: 500 }
        );
    }
}
