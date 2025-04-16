import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExamAttempt, ExamResponse, Question } from "@prisma/client";

type ExamResponseWithQuestion = ExamResponse & {
    question: Question;
};

export async function POST(
    request: Request,
    { params }: { params: { organizationId: string; examId: string; attemptId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized", success: false },
                { status: 401 }
            );
        }

        const { organizationId, examId, attemptId } = params;

        // Validate the attempt exists and belongs to the user
        const attempt = await prisma.examAttempt.findUnique({
            where: {
                id: attemptId,
                userId: session.user.id,
                examId: examId,
                exam: {
                    organizationId: organizationId,
                },
            },
            include: {
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!attempt) {
            return NextResponse.json(
                { error: "Exam attempt not found", success: false },
                { status: 404 }
            );
        }

        if (attempt.submittedAt) {
            return NextResponse.json(
                { error: "This exam has already been submitted", success: false },
                { status: 400 }
            );
        }

        // Check if at least one question is answered
        const hasResponses = attempt.responses.some(
            (response: ExamResponseWithQuestion) => 
                response.response !== null && 
                response.response !== "" && 
                typeof response.response === "string"
        );

        if (!hasResponses) {
            return NextResponse.json(
                { error: "Please answer at least one question before submitting", success: false },
                { status: 400 }
            );
        }

        // Grade the responses
        const gradedResponses = attempt.responses.map((response: ExamResponseWithQuestion) => {
            let score = 0;
            if (response.question.type === "MULTIPLE_CHOICE") {
                score = response.response === response.question.correctAnswer ? response.question.points : 0;
            } else if (response.question.type === "SHORT_ANSWER") {
                // For short answers, we'll need manual grading
                score = 0;
            }

            return {
                ...response,
                score,
            };
        });

        // Update the attempt status and save graded responses
        await prisma.$transaction([
            prisma.examAttempt.update({
                where: { id: attemptId },
                data: {
                    submittedAt: new Date(),
                },
            }),
            ...gradedResponses.map((response: ExamResponseWithQuestion) =>
                prisma.examResponse.update({
                    where: {
                        id: response.id,
                    },
                    data: {
                        score: response.score,
                    },
                })
            ),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return NextResponse.json(
            { error: "An error occurred while submitting the exam", success: false },
            { status: 500 }
        );
    }
}
