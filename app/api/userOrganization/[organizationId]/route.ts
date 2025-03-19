import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import console from "console";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    try {
        const { organizationId } = await params;

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

        const userOrganizationInfo = await prisma.userOrganization.findMany({
            where: { organizationId: organizationId, userId: session.user.id },
        });

        return NextResponse.json(
            { userOrganizationInfo },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Unexpected error:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Failed to retrieve organization details" },
            { status: 500 }
        );
    }
}
