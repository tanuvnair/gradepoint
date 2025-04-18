import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { organizationId, examId } = await params;

    const membership = await prisma.userOrganization.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
    });

    if (!membership) {
        return NextResponse.json(
            { error: "You are not a member of this organization" },
            { status: 403 }
        );
    }

    // First, check for any existing unsubmitted attempts
    const existingAttempt = await prisma.examAttempt.findFirst({
        where: {
            userId,
            examId,
            submittedAt: null,
        },
        orderBy: {
            startedAt: "desc",
        },
    });

    if (existingAttempt) {
        // Return the existing attempt instead of creating a new one
        const exam = await prisma.exam.findFirst({
            where: {
                id: examId,
                organizationId,
            },
            include: {
                sections: {
                    orderBy: { order: "asc" },
                    include: {
                        questions: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        if (!exam) {
            return NextResponse.json(
                { error: "Exam not available" },
                { status: 404 }
            );
        }

        const examStructure = exam.sections.map((section) => ({
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
            attemptId: existingAttempt.id,
            exam: {
                title: exam.title,
                timeLimit: exam.timeLimit,
                sections: examStructure,
            },
        });
    }

    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            organizationId,
            publishedAt: { not: null },
            OR: [
                { startDate: null },
                { startDate: { lte: new Date() } },
                { endDate: null },
                { endDate: { gte: new Date() } }
            ],
        },
        include: {
            sections: {
                orderBy: { order: "asc" },
                include: {
                    questions: { orderBy: { order: "asc" } },
                },
            },
        },
    });

    if (!exam) {
        return NextResponse.json(
            { error: "Exam not available" },
            { status: 404 }
        );
    }

    const attemptCount = await prisma.examAttempt.count({
        where: { 
            userId, 
            examId,
            submittedAt: { not: null } // Only count submitted attempts
        },
    });

    if (exam.allowedAttempts !== null && attemptCount >= exam.allowedAttempts) {
        return NextResponse.json(
            { error: "Maximum attempts reached" },
            { status: 403 }
        );
    }

    const attempt = await prisma.examAttempt.create({
        data: {
            userId,
            examId,
        },
    });

    const examStructure = exam.sections.map((section) => ({
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
        attemptId: attempt.id,
        exam: {
            title: exam.title,
            timeLimit: exam.timeLimit,
            sections: examStructure,
        },
    });
}
