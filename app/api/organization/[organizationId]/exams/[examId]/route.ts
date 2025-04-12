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

        const exam = await prisma.exam.findUnique({
            where: {
                id: examId,
                organizationId: organizationId,
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

export async function DELETE(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const { organizationId, examId } = await params;
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

        const exam = await prisma.exam.findUnique({
            where: {
                id: examId,
                organizationId: organizationId,
            },
        });

        if (!exam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        const isOwnerOrAdmin =
            userOrg.role === "OWNER" || userOrg.role === "ADMIN";
        const isCreator = exam.creatorId === session.user.id;

        if (!isOwnerOrAdmin && !isCreator) {
            return NextResponse.json(
                {
                    error: "Forbidden: You do not have permission to delete this exam",
                },
                { status: 403 }
            );
        }

        await prisma.exam.delete({
            where: { id: examId },
        });

        return NextResponse.json({ message: "Exam deleted successfully" });
    } catch (error) {
        console.error("[EXAM_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
