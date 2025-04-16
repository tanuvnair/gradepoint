import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export async function PATCH(
    request: Request,
    { params }: { params: { organizationId: string; examId: string } }
) {
    const { organizationId, examId } = await params;

    let session;
    try {
        session = await auth();
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

    const userId = session.user.id;

    try {
        const membership = await prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
            select: {
                role: true,
            },
        });

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const exam = await prisma.exam.findUnique({
            where: {
                id: examId,
                organizationId,
            },
            select: {
                id: true,
                publishedAt: true,
                creatorId: true, // Corrected here: changed from 'createdBy' to 'creatorId'
            },
        });

        if (!exam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        if (exam.publishedAt) {
            return NextResponse.json(
                { error: "Exam already published" },
                { status: 400 }
            );
        }

        // Check the role and permissions
        if (membership.role === "OWNER" || membership.role === "ADMIN") {
            // Owners and Admins can publish any exam
        } else if (membership.role === "INSTRUCTOR") {
            // Instructors can only publish exams they created
            if (exam.creatorId !== userId) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }
        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedExam = await prisma.exam.update({
            where: {
                id: examId,
                organizationId,
            },
            data: {
                publishedAt: new Date(),
            },
        });

        return NextResponse.json(updatedExam);
    } catch (error: unknown) {
        console.error("Error updating exam:", getErrorMessage(error));
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
