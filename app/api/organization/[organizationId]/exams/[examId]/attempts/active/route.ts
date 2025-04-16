import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    {
        params,
    }: { params: { organizationId: string; examId: string } }
) {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { organizationId, examId } = params;

    // Verify organization membership
    const membership = await prisma.userOrganization.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
    });

    if (!membership) {
        return NextResponse.json(
            { error: "You are not a member of this organization" },
            { status: 403 }
        );
    }

    // Verify exam exists and belongs to the organization
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            organizationId,
            publishedAt: { not: null },
        },
    });

    if (!exam) {
        return NextResponse.json(
            { error: "Exam not found or not published" },
            { status: 404 }
        );
    }

    // Find active (unsubmitted) attempts for this user and exam
    const activeAttempt = await prisma.examAttempt.findFirst({
        where: {
            userId,
            examId,
            submittedAt: null,
        },
        orderBy: {
            startedAt: "desc", // Get the most recent attempt
        },
    });

    // If there's an active attempt, check if it's still valid (within time limit)
    if (activeAttempt && exam.timeLimit) {
        const startedAt = new Date(activeAttempt.startedAt);
        const elapsedMinutes = (Date.now() - startedAt.getTime()) / (1000 * 60);

        // If the time limit has expired, automatically submit the attempt
        if (elapsedMinutes > exam.timeLimit) {
            await prisma.examAttempt.update({
                where: { id: activeAttempt.id },
                data: { submittedAt: new Date() },
            });

            // Return no active attempt since it's been auto-submitted
            return NextResponse.json({ attempt: null });
        }
    }

    return NextResponse.json({ attempt: activeAttempt });
}
