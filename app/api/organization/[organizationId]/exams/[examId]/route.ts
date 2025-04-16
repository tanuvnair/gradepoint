import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const { organizationId, examId } = await params;
    try {
        const exam = await prisma.exam.findFirst({
            where: {
                id: examId,
                organizationId,
            },
            include: {
                sections: {
                    orderBy: { order: "asc" },
                    include: {
                        questions: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!exam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error("[EXAM_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const { organizationId, examId } = await params;
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            timeLimit,
            passingScore,
            randomizeOrder,
            publishedAt,
            startDate,
            endDate,
            allowedAttempts,
            sections,
        } = body;

        console.log("randomizeOrder from request:", randomizeOrder, typeof randomizeOrder);

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        // Check if exam exists and belongs to the organization
        const existingExam = await prisma.exam.findFirst({
            where: {
                id: examId,
                organizationId,
            },
        });

        if (!existingExam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        // Update exam
        const updatedExam = await prisma.exam.update({
            where: {
                id: examId,
            },
            data: {
                title,
                description,
                timeLimit,
                passingScore,
                randomizeOrder,
                publishedAt,
                startDate,
                endDate,
                allowedAttempts,
            },
        });

        const existingSections = await prisma.examSection.findMany({
            where: { examId },
            include: { questions: true },
        });

        const updatedSectionIds = sections
            .filter((section) => section.id)
            .map((section) => section.id);

        for (const existingSection of existingSections) {
            if (!updatedSectionIds.includes(existingSection.id)) {
                // Delete the section and its questions (cascade delete should handle this)
                await prisma.examSection.delete({
                    where: { id: existingSection.id },
                });
            } else {
                // For sections that remain, delete questions not in the update
                const sectionUpdate = sections.find(
                    (s) => s.id === existingSection.id
                );
                const updatedQuestionIds = sectionUpdate.questions
                    .filter((question) => question.id)
                    .map((question) => question.id);

                for (const existingQuestion of existingSection.questions) {
                    if (!updatedQuestionIds.includes(existingQuestion.id)) {
                        await prisma.question.delete({
                            where: { id: existingQuestion.id },
                        });
                    }
                }
            }
        }

        // Update sections and questions
        for (const section of sections) {
            if (section.id) {
                // Update existing section
                await prisma.examSection.update({
                    where: {
                        id: section.id,
                    },
                    data: {
                        title: section.title,
                        description: section.description,
                        order: section.order,
                    },
                });

                // Update questions
                for (const question of section.questions) {
                    if (question.id) {
                        await prisma.question.update({
                            where: {
                                id: question.id,
                            },
                            data: {
                                content: question.content,
                                type: question.type,
                                points: question.points,
                                order: question.order,
                                options: question.options,
                                correctAnswer: question.correctAnswer,
                            },
                        });
                    } else {
                        // Create new question
                        await prisma.question.create({
                            data: {
                                content: question.content,
                                type: question.type,
                                points: question.points,
                                order: question.order,
                                options: question.options,
                                correctAnswer: question.correctAnswer,
                                sectionId: section.id,
                            },
                        });
                    }
                }
            } else {
                // Create new section
                const newSection = await prisma.examSection.create({
                    data: {
                        title: section.title,
                        description: section.description,
                        order: section.order,
                        examId,
                    },
                });

                // Create questions for new section
                for (const question of section.questions) {
                    await prisma.question.create({
                        data: {
                            content: question.content,
                            type: question.type,
                            points: question.points,
                            order: question.order,
                            options: question.options,
                            correctAnswer: question.correctAnswer,
                            sectionId: newSection.id,
                        },
                    });
                }
            }
        }

        return NextResponse.json(updatedExam);
    } catch (error) {
        console.error("[EXAM_UPDATE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const { organizationId, examId } = await params;
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if exam exists and belongs to the organization
        const existingExam = await prisma.exam.findFirst({
            where: {
                id: examId,
                organizationId,
            },
        });

        if (!existingExam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        // Delete exam (cascade will handle sections and questions)
        await prisma.exam.delete({
            where: {
                id: examId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[EXAM_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
