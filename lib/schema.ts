import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email().nonempty("Email field cannot be empty"),
    password: z.string().nonempty("Password field cannot be empty"),
});

export const signUpSchema = z.object({
    name: z.string().nonempty("Name field cannot be empty"),
    email: z.string().email(),
    password: z.string().min(8, "Password must contain atleast 8 characters"),
    confirmPassword: z.string().min(8, "Password must contain atleast 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});
