import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

const createExamSchema = z.object({
    title: z.string().min(1, "Title is required").max(20, "Title must be less than 20 characters"),
    description: z.string().optional(),
    timeLimit: z
        .number()
        .min(1, "Time limit must be at least 1 minute")
        .nullable()
        .optional(),
    passingScore: z
        .number()
        .min(0, "Passing score cannot be negative")
        .optional(),
    randomizeOrder: z.boolean().default(false),
    publishedAt: z.string().datetime().nullable(),
    startDate: z.string().datetime().nullable(),
    endDate: z.string().datetime().nullable(),
    allowedAttempts: z.number().min(1, "Allowed attempts must be at least 1").nullable().optional(),
    sections: z
        .array(
            z.object({
                title: z.string().min(1, "Section title is required"),
                description: z.string().optional(),
                order: z.number().min(0, "Order must be 0 or greater"),
                questions: z
                    .array(
                        z.object({
                            content: z
                                .string()
                                .min(1, "Question content is required"),
                            type: z.enum([
                                "MULTIPLE_CHOICE",
                                "SHORT_ANSWER",
                                "OPEN_ENDED",
                                "CODE_BASED",
                            ]),
                            points: z
                                .number()
                                .min(0.1, "Points must be at least 0.1"),
                            order: z
                                .number()
                                .min(0, "Order must be 0 or greater"),
                            options: z.record(z.unknown()).optional(),
                            correctAnswer: z.record(z.unknown()).optional(),
                        })
                    )
                    .min(1, "Each section must have at least one question"),
            })
        )
        .min(1, "Exam must have at least one section"),
});

export async function POST(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    const { organizationId } = await params;

    let session;
    try {
        session = await auth();
        console.log("Authenticated user:", session?.user.id);
    } catch (error: unknown) {
        console.error("Error during authentication:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Authentication error" },
            { status: 500 }
        );
    }

    if (!session?.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId,
                users: {
                    some: {
                        userId: session.user.id,
                        role: {
                            in: ["OWNER", "ADMIN", "INSTRUCTOR"],
                        },
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found or unauthorized" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validation = createExamSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors },
                { status: 400 }
            );
        }

        const exam = await prisma.$transaction(async (prisma) => {
            const exam = await prisma.exam.create({
                data: {
                    title: validation.data.title,
                    description: validation.data.description,
                    timeLimit: validation.data.timeLimit,
                    passingScore: validation.data.passingScore,
                    randomizeOrder: validation.data.randomizeOrder,
                    publishedAt: validation.data.publishedAt ? new Date(validation.data.publishedAt) : null,
                    startDate: validation.data.startDate ? new Date(validation.data.startDate) : null,
                    endDate: validation.data.endDate ? new Date(validation.data.endDate) : null,
                    allowedAttempts: validation.data.allowedAttempts,
                    creatorId: session.user.id,
                    organizationId: organizationId,
                    sections: {
                        create: validation.data.sections.map((section) => ({
                            title: section.title,
                            description: section.description,
                            order: section.order,
                            questions: {
                                create: section.questions.map((question) => ({
                                    content: question.content,
                                    type: question.type,
                                    points: question.points,
                                    order: question.order,
                                    options: question.options,
                                    correctAnswer: question.correctAnswer,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    sections: {
                        include: {
                            questions: true,
                        },
                    },
                },
            });
            return exam;
        });

        return NextResponse.json(exam, { status: 201 });
    } catch (error) {
        console.error("[EXAM_CREATE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    const { organizationId } = await params;

    let session;
    try {
        session = await auth();
        console.log("Authenticated user:", session?.user.id);
    } catch (error: unknown) {
        console.error("Error during authentication:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Authentication error" },
            { status: 500 }
        );
    }

    if (!session?.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userOrg = await prisma.userOrganization.findFirst({
            where: {
                userId: session.user.id,
                organizationId: organizationId,
            },
        });

        if (!userOrg) {
            return NextResponse.json(
                { error: "Organization not found or unauthorized" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const published = searchParams.get("published");
        const limit = searchParams.get("limit");
        const page = searchParams.get("page");

        const where: any = {
            organizationId: organizationId,
        };

        if (published === "true") {
            where.publishedAt = { not: null };
        } else if (published === "false") {
            where.publishedAt = null;
        }

        const take = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 10;
        const skip = page ? (parseInt(page) - 1) * take : 0;

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where,
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
                },
                orderBy: {
                    createdAt: "desc",
                },
                take,
                skip,
            }),
            prisma.exam.count({ where }),
        ]);

        return NextResponse.json({
            data: exams,
            meta: {
                total,
                page: page ? parseInt(page) : 1,
                limit: take,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        console.error("[EXAMS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
