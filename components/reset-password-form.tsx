"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AlertType = {
    variant: "default" | "destructive";
    type: string;
    title: string;
    message: string;
};

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must contain at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function ResetPasswordForm() {
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    if (!token) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        Invalid or expired reset link. Please request a new password reset.
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Request new reset link
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    const handleSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
        setIsLoading(true);
        setAlert(null);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password: values.password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setAlert({
                variant: "default",
                type: "success",
                title: "Success",
                message: "Password reset successfully. You can now sign in with your new password.",
            });

            // Redirect to sign in after 3 seconds
            setTimeout(() => {
                router.push("/signin");
            }, 3000);
        } catch (error) {
            setAlert({
                variant: "destructive",
                type: "error",
                title: "Error",
                message: error instanceof Error ? error.message : "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password below.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                    <CardContent>
                        <div className="grid gap-4">
                            {alert && (
                                <Alert variant={alert.variant}>
                                    {alert.type === "success" ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    <div className="ml-2 mt-1">
                                        <AlertTitle>{alert.title}</AlertTitle>
                                        <AlertDescription>{alert.message}</AlertDescription>
                                    </div>
                                </Alert>
                            )}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your new password"
                                                type="password"
                                                className="h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-destructive" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Confirm your new password"
                                                type="password"
                                                className="h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                        <Link
                            href="/signin"
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Back to sign in
                        </Link>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
