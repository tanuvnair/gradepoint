import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.$transaction([
            prisma.invite.deleteMany({ where: { organizationId } }),
            prisma.exam.deleteMany({ where: { organizationId } }),
            prisma.userOrganization.deleteMany({ where: { organizationId } }),
            prisma.organization.delete({ where: { id: organizationId } }),
        ]);

        const otherOrganization = await prisma.userOrganization.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        });

        return NextResponse.json({
            message: "Organization deleted successfully",
            redirectTo: otherOrganization ? otherOrganization.organizationId : null
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
