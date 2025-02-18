import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds) as string;
}

export async function verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}
