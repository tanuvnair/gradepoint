import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    {
        params,
    }: { params: { organizationId: string; examId: string; attemptId: string } }
) {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { organizationId, examId, attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
            exam: {
                include: {
                    organization: true,
                    sections: {
                        orderBy: { order: "asc" },
                        include: {
                            questions: { orderBy: { order: "asc" } },
                        },
                    },
                },
            },
            responses: true,
        },
    });

    if (!attempt || attempt.userId !== userId) {
        return NextResponse.json(
            { error: "Attempt not found or unauthorized" },
            { status: 404 }
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

    const examData = attempt.exam.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        questions: section.questions.map((q) => ({
            id: q.id,
            content: q.content,
            type: q.type,
            points: q.points,
            order: q.order,
            options: q.options,
        })),
    }));

    return NextResponse.json({
        attempt: {
            id: attempt.id,
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            graded: attempt.graded,
            score: attempt.score,
            responses: attempt.responses,
        },
        exam: {
            title: attempt.exam.title,
            timeLimit: attempt.exam.timeLimit,
            sections: examData,
        },
    });
}
