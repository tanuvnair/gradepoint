import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    {
        params,
    }: { params: { organizationId: string; examId: string; attemptId: string } }
) {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { organizationId, examId, attemptId } = params;
    const body = await req.json();

    const { responses } = body;
    if (!Array.isArray(responses)) {
        return NextResponse.json(
            { error: "Invalid payload: responses[] required" },
            { status: 400 }
        );
    }

    const attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
            exam: true,
        },
    });

    if (!attempt || attempt.userId !== userId) {
        return NextResponse.json(
            { error: "Attempt not found or unauthorized" },
            { status: 403 }
        );
    }

    if (attempt.submittedAt) {
        return NextResponse.json(
            { error: "Attempt already submitted" },
            { status: 400 }
        );
    }

    if (
        attempt.examId !== examId ||
        attempt.exam.organizationId !== organizationId
    ) {
        return NextResponse.json(
            { error: "Attempt does not match exam or organization" },
            { status: 400 }
        );
    }

    const upserts = responses.map(({ questionId, response }) =>
        prisma.examResponse.upsert({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId,
                },
            },
            create: {
                attemptId,
                questionId,
                userId,
                response,
            },
            update: {
                response,
            },
        })
    );

    await prisma.$transaction(upserts);

    return NextResponse.json({ success: true });
}
