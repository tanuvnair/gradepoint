import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

// Create organization
export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        try {
            const organization = await prisma.organization.create({
                data: {
                    name,
                    ownerId: session.user.id,
                },
            });
            console.log("Organization created:", organization);
            return NextResponse.json(organization, { status: 201 });
        } catch (error) {
            console.error("Error creating organization:", error);
        }
    } catch {
        return NextResponse.json(
            { error: "Failed to create organization" },
            { status: 500 }
        );
    }
}
