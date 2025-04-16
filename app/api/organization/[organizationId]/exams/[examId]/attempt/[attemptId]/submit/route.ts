import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExamAttempt, ExamResponse, Question } from "@prisma/client";
import { gradeResponse } from "@/lib/gemini";

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

        const { organizationId, examId, attemptId } = await params;

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

        // Grade each response using Gemini AI
        const gradedResponses = await Promise.all(
            attempt.responses.map(async (response: ExamResponseWithQuestion) => {
                if (response.question.type === "MULTIPLE_CHOICE") {
                    // For multiple choice, we can grade automatically
                    const isCorrect = response.response === response.question.correctAnswer;
                    return {
                        ...response,
                        isCorrect,
                        score: isCorrect ? response.question.points : 0,
                        feedback: isCorrect ? "Correct answer!" : "Incorrect answer."
                    };
                } else {
                    // For other types, use Gemini AI
                    const gradingResult = await gradeResponse({
                        question: response.question.content,
                        correctAnswer: response.question.correctAnswer,
                        studentResponse: response.response,
                        questionType: response.question.type,
                        points: response.question.points
                    });

                    return {
                        ...response,
                        isCorrect: gradingResult.isCorrect,
                        score: gradingResult.score,
                        feedback: gradingResult.feedback
                    };
                }
            })
        );

        // Calculate total score
        const totalScore = gradedResponses.reduce(
            (sum, response) => sum + (response.score || 0),
            0
        );

        // Update the attempt status and save graded responses
        await prisma.$transaction([
            prisma.examAttempt.update({
                where: { id: attemptId },
                data: {
                    submittedAt: new Date(),
                    score: totalScore,
                    graded: true
                },
            }),
            ...gradedResponses.map((response) =>
                prisma.examResponse.update({
                    where: {
                        id: response.id,
                    },
                    data: {
                        isCorrect: response.isCorrect,
                        score: response.score,
                        feedback: response.feedback
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
