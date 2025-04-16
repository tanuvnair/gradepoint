import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const { organizationId } = params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's role in the organization
        const userOrg = await prisma.userOrganization.findFirst({
            where: {
                userId: session.user.id,
                organizationId: organizationId,
            },
        });

        if (!userOrg) {
            return NextResponse.json(
                { error: "User not found in organization" },
                { status: 404 }
            );
        }

        let stats;

        if (userOrg.role === "STUDENT") {
            // For students, get their exam attempts and performance
            const attempts = await prisma.examAttempt.findMany({
                where: {
                    userId: session.user.id,
                    exam: {
                        organizationId: organizationId,
                    },
                    submittedAt: { not: null },
                },
                include: {
                    exam: {
                        select: {
                            title: true,
                            description: true,
                            passingScore: true,
                            sections: {
                                include: {
                                    questions: {
                                        select: {
                                            points: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    responses: {
                        include: {
                            question: {
                                select: {
                                    id: true,
                                    content: true,
                                    type: true,
                                    points: true,
                                    options: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    submittedAt: "desc",
                },
                take: 5,
            });

            const totalAttempts = await prisma.examAttempt.count({
                where: {
                    userId: session.user.id,
                    exam: {
                        organizationId: organizationId,
                    },
                    submittedAt: { not: null },
                },
            });

            // Calculate total marks for each exam
            const attemptsWithMarks = attempts.map(attempt => {
                const totalMarks = attempt.exam.sections.reduce((sum, section) => 
                    sum + section.questions.reduce((sectionSum, question) => 
                        sectionSum + question.points, 0), 0);
                return {
                    ...attempt,
                    exam: {
                        ...attempt.exam,
                        totalMarks,
                    },
                };
            });

            const totalMarksObtained = attemptsWithMarks.reduce((sum, attempt) => 
                sum + (attempt.score || 0), 0);
            const totalMarksAvailable = attemptsWithMarks.reduce((sum, attempt) => 
                sum + attempt.exam.totalMarks, 0);
            const averageMarks = totalAttempts > 0 ? totalMarksObtained / totalAttempts : 0;

            // Get upcoming exams
            const upcomingExams = await prisma.exam.findMany({
                where: {
                    organizationId: organizationId,
                    publishedAt: { not: null },
                    OR: [
                        { startDate: null },
                        { startDate: { gt: new Date() } }
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    startDate: true,
                    endDate: true,
                    timeLimit: true,
                },
                orderBy: {
                    startDate: 'asc',
                },
            });

            stats = {
                role: "STUDENT",
                recentAttempts: attemptsWithMarks,
                totalAttempts,
                averageMarks,
                totalMarksAvailable,
                passingMarks: attemptsWithMarks.reduce((sum, attempt) => 
                    sum + (attempt.exam.passingScore || 0), 0),
                upcomingExams,
            };
        } else if (userOrg.role === "INSTRUCTOR") {
            // For instructors, get stats about their created exams
            const createdExams = await prisma.exam.findMany({
                where: {
                    creatorId: session.user.id,
                    organizationId: organizationId,
                },
                include: {
                    attempts: {
                        where: {
                            submittedAt: { not: null },
                        },
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                            responses: {
                                include: {
                                    question: {
                                        select: {
                                            id: true,
                                            content: true,
                                            type: true,
                                            points: true,
                                            options: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    sections: {
                        include: {
                            questions: {
                                select: {
                                    points: true,
                                },
                            },
                        },
                    },
                },
            });

            const totalExams = createdExams.length;
            const totalAttempts = createdExams.reduce((sum, exam) => sum + exam.attempts.length, 0);

            // Calculate total marks for each exam
            const examsWithMarks = createdExams.map(exam => {
                const totalMarks = exam.sections.reduce((sum, section) => 
                    sum + section.questions.reduce((sectionSum, question) => 
                        sectionSum + question.points, 0), 0);
                return {
                    ...exam,
                    totalMarks,
                };
            });

            const totalMarksObtained = examsWithMarks.reduce((sum, exam) => 
                sum + exam.attempts.reduce((examSum, attempt) => 
                    examSum + (attempt.score || 0), 0), 0);
            const averageMarks = totalAttempts > 0 ? totalMarksObtained / totalAttempts : 0;

            // Get upcoming exams
            const upcomingExams = await prisma.exam.findMany({
                where: {
                    creatorId: session.user.id,
                    organizationId: organizationId,
                    publishedAt: { not: null },
                    OR: [
                        { startDate: null },
                        { startDate: { gt: new Date() } }
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    startDate: true,
                    endDate: true,
                    timeLimit: true,
                },
                orderBy: {
                    startDate: 'asc',
                },
            });

            stats = {
                role: "INSTRUCTOR",
                totalExams,
                totalAttempts,
                averageMarks,
                totalMarksAvailable: examsWithMarks.reduce((sum, exam) => 
                    sum + (exam.totalMarks * exam.attempts.length), 0),
                passingMarks: examsWithMarks.reduce((sum, exam) => 
                    sum + (exam.passingScore || 0), 0),
                recentAttempts: examsWithMarks.flatMap(exam => 
                    exam.attempts.map(attempt => ({
                        ...attempt,
                        exam: {
                            title: exam.title,
                            description: exam.description,
                            passingScore: exam.passingScore,
                            totalMarks: exam.totalMarks,
                        },
                    }))
                ).sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()).slice(0, 5),
                upcomingExams,
            };
        } else {
            // For admins and owners, get stats about all exams in the organization
            const allExams = await prisma.exam.findMany({
                where: {
                    organizationId: organizationId,
                },
                include: {
                    attempts: {
                        where: {
                            submittedAt: { not: null },
                        },
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                            responses: {
                                include: {
                                    question: {
                                        select: {
                                            id: true,
                                            content: true,
                                            type: true,
                                            points: true,
                                            options: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    creator: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    sections: {
                        include: {
                            questions: {
                                select: {
                                    points: true,
                                },
                            },
                        },
                    },
                },
            });

            const totalExams = allExams.length;
            const totalAttempts = allExams.reduce((sum, exam) => sum + exam.attempts.length, 0);

            // Calculate total marks for each exam
            const examsWithMarks = allExams.map(exam => {
                const totalMarks = exam.sections.reduce((sum, section) => 
                    sum + section.questions.reduce((sectionSum, question) => 
                        sectionSum + question.points, 0), 0);
                return {
                    ...exam,
                    totalMarks,
                };
            });

            const totalMarksObtained = examsWithMarks.reduce((sum, exam) => 
                sum + exam.attempts.reduce((examSum, attempt) => 
                    examSum + (attempt.score || 0), 0), 0);
            const averageMarks = totalAttempts > 0 ? totalMarksObtained / totalAttempts : 0;

            // Get upcoming exams
            const upcomingExams = await prisma.exam.findMany({
                where: {
                    organizationId: organizationId,
                    publishedAt: { not: null },
                    OR: [
                        { startDate: null },
                        { startDate: { gt: new Date() } }
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    startDate: true,
                    endDate: true,
                    timeLimit: true,
                    creator: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    startDate: 'asc',
                },
            });

            stats = {
                role: userOrg.role,
                totalExams,
                totalAttempts,
                averageMarks,
                totalMarksAvailable: examsWithMarks.reduce((sum, exam) => 
                    sum + (exam.totalMarks * exam.attempts.length), 0),
                passingMarks: examsWithMarks.reduce((sum, exam) => 
                    sum + (exam.passingScore || 0), 0),
                recentAttempts: examsWithMarks.flatMap(exam => 
                    exam.attempts.map(attempt => ({
                        ...attempt,
                        exam: {
                            title: exam.title,
                            description: exam.description,
                            passingScore: exam.passingScore,
                            totalMarks: exam.totalMarks,
                            creator: exam.creator,
                        },
                    }))
                ).sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()).slice(0, 5),
                upcomingExams,
            };
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("[DASHBOARD_STATS_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 