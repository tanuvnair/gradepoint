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
    const { organizationId, examId, attemptId } = await params;
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

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string; examId: string; attemptId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { organizationId, examId, attemptId } = params;

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

        // Get the exam attempt with responses
        const attempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                examId: examId,
                exam: {
                    organizationId: organizationId
                },
                // If user is a student, only allow viewing their own attempts
                ...(userOrg.role === "STUDENT" ? { userId: session.user.id } : {})
            },
            include: {
                responses: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!attempt) {
            return NextResponse.json(
                { error: "Exam attempt not found" },
                { status: 404 }
            );
        }

        // Format the responses
        const formattedResponses = attempt.responses.map(response => ({
            questionId: response.questionId,
            content: response.question.content,
            type: response.question.type,
            points: response.question.points,
            response: response.response,
            isCorrect: response.isCorrect,
            score: response.score,
            feedback: response.feedback
        }));

        return NextResponse.json({ responses: formattedResponses });

    } catch (error) {
        console.error("Error fetching exam responses:", error);
        return NextResponse.json(
            { error: "Failed to fetch exam responses" },
            { status: 500 }
        );
    }
}
