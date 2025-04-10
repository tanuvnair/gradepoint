import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function GET(
    request: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const { organizationId } = await params;

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userMembership = await prisma.userOrganization.findFirst({
            where: {
                userId: session.user.id,
                organizationId: organizationId
            }
        });

        if (!userMembership) {
            return NextResponse.json(
                { error: "You don't have access to this organization" },
                { status: 403 }
            );
        }

        const members = await prisma.userOrganization.findMany({
            where: {
                organizationId: organizationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        createdAt: true
                    }
                }
            },
            orderBy: [
                { role: 'asc' },
                { user: { name: 'asc' } }
            ]
        });

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                name: true,
                ownerId: true
            }
        });

        const users = members.map(member => ({
            ...member.user,
            role: member.role,
        }));

        return NextResponse.json(
            {
                organizationName: organization?.name,
                users
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error fetching organization users:", getErrorMessage(error));
        return NextResponse.json(
            {
                error: "Failed to retrieve organization users",
                details: process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined
            },
            { status: 500 }
        );
    }
}
