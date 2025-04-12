import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
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

    const userOrg = await prisma.userOrganization.findFirst({
        where: {
            userId: session?.user.id,
            organizationId,
        },
    });

    if (!userOrg) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exams = await prisma.exam.findMany({
        where: {
            organizationId,
            publishedAt: { not: null },
        },
        select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            publishedAt: true,
            _count: {
                select: {
                    sections: true,
                    attempts: true,
                },
            },
        },
        orderBy: {
            publishedAt: "desc",
        },
    });

    return NextResponse.json(exams);
}
