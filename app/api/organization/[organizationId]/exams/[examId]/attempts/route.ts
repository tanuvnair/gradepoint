import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { organizationId, examId } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Get user's role in the organization
        const userOrg = await prisma.userOrganization.findFirst({
            where: {
                userId: session.user.id,
                organizationId,
            },
        });

        if (!userOrg) {
            return NextResponse.json(
                { error: "You don't have access to this organization" },
                { status: 403 }
            );
        }

        // Get exam attempts
        const attempts = await prisma.examAttempt.findMany({
            where: {
                examId,
                exam: {
                    organizationId,
                },
                // If user is a student, only allow viewing their own attempts
                // If a specific userId is provided, only show that user's attempts
                ...(userOrg.role === "STUDENT" ? { userId: session.user.id } : userId ? { userId } : {}),
                submittedAt: { not: null }, // Only get completed attempts
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });

        return NextResponse.json({ attempts });

    } catch (error) {
        console.error("Error fetching exam attempts:", error);
        return NextResponse.json(
            { error: "Failed to fetch exam attempts" },
            { status: 500 }
        );
    }
} 