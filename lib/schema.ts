import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const signUpSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(8),
});
