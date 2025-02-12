import { hashPassword } from '@/lib/hashing';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, email, password } = await req.json();

        // Check if email is already in use
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            return NextResponse.json({error: "Email already in use"}, {status: 400})
        }

        // Hased password
        const hashedPassword = await hashPassword(password);

        // Create user
        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        })

        return NextResponse.json({message: "User registered successfully"}, {status: 201})
    } catch {
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }
}
