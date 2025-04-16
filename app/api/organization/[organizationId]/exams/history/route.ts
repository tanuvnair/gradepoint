import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { organizationId } = params;

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

        // For students, only fetch their own attempts
        // For staff (admin, instructor, owner), fetch all attempts
        const attempts = await prisma.examAttempt.findMany({
            where: {
                exam: {
                    organizationId,
                },
                ...(userOrg.role === "STUDENT" ? { userId: session.user.id } : {}),
                submittedAt: { not: null }, // Only get completed attempts
            },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        timeLimit: true,
                        passingScore: true,
                        randomizeOrder: true,
                        startDate: true,
                        endDate: true,
                        allowedAttempts: true,
                        sections: {
                            select: {
                                title: true,
                                description: true,
                                questions: {
                                    select: {
                                        id: true,
                                        content: true,
                                        type: true,
                                        points: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });

        // Format the response
        const exams = attempts.map((attempt) => {
            // Ensure we have valid dates for time spent calculation
            const startTime = attempt.startedAt || new Date();
            const endTime = attempt.submittedAt || new Date();
            const score = attempt.score || 0;

            return {
                id: attempt.exam.id,
                title: attempt.exam.title,
                description: attempt.exam.description,
                timeLimit: attempt.exam.timeLimit,
                passingScore: attempt.exam.passingScore,
                randomizeOrder: attempt.exam.randomizeOrder,
                startDate: attempt.exam.startDate,
                endDate: attempt.exam.endDate,
                allowedAttempts: attempt.exam.allowedAttempts,
                sections: attempt.exam.sections,
                attempt: {
                    userId: attempt.userId,
                    studentName: attempt.user.name || 'Unknown Student',
                    score: score,
                    timeSpent: formatTimeSpent(startTime, endTime),
                    submittedAt: endTime.toISOString(),
                    totalQuestions: attempt.exam.sections.reduce(
                        (acc, section) => acc + section.questions.length,
                        0
                    ),
                    correctAnswers: Math.round(
                        (score / 100) *
                            attempt.exam.sections.reduce(
                                (acc, section) => acc + section.questions.length,
                                0
                            )
                    ),
                },
            };
        });

        return NextResponse.json({
            exams,
            userRole: userOrg.role,
            userId: session.user.id,
        });
    } catch (error) {
        console.error("Error fetching exam history:", error);
        return NextResponse.json(
            { error: "Failed to fetch exam history" },
            { status: 500 }
        );
    }
}

function formatTimeSpent(startedAt: Date, submittedAt: Date): string {
    const diffInMinutes = Math.round(
        (submittedAt.getTime() - startedAt.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
} 