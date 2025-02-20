"use client";

// Icons
import { AlertCircle, CheckCheck } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
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
import { signUpSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AlertType = {
    variant: "default" | "destructive";
    type: string;
    title: string;
    message: string;
};

export function SignUpForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [alert, setAlert] = useState<AlertType | null>();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSignUp(values: z.infer<typeof signUpSchema>) {
        setAlert(null);
        console.log();

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setAlert({
                    variant: "destructive",
                    type: "error",
                    title: "Error",
                    message: message as string,
                });
            } else {
                await signIn("credentials", {
                    redirectTo: "/dashboard/overview",
                    email: values.email,
                    password: values.password,
                });
            }
        } catch (error: unknown) {
            setAlert({
                variant: "destructive",
                type: "error",
                title: "Error",
                message: error as string,
            });
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {alert && (
                <Alert variant={alert.variant}>
                    {alert.type === "success" ? (
                        <CheckCheck />
                    ) : alert.type === "error" ? (
                        <AlertCircle />
                    ) : null}
                    <div className="ml-2 mt-1">
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                    </div>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>
                        Enter your details to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSignUp)}>
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Your Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Your Name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Email"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Password"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-2 flex gap-4 flex-col lg:flex-row">
                                    <Button type="submit" className="w-full">
                                        Sign Up
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => signIn("google")}
                                    >
                                        <FaGoogle />
                                        Sign Up with Google
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <Link
                                    href="/signin"
                                    className="underline underline-offset-4"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
