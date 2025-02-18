"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

type AlertType = {
    variant: "default" | "destructive";
    type: string;
    title: string;
    message: string;
};

export function SignInForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [alert, setAlert] = useState<AlertType | null>();

    async function onSignIn(formData: FormData) {
        setAlert(null);

        try {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            const response = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (response?.error) {
                setAlert({
                    variant: "destructive",
                    type: "error",
                    title: "Error",
                    message: "Invalid email or password",
                });
            } else {
                setAlert({
                    variant: "default",
                    type: "success",
                    title: "Success!",
                    message: "Successfully signed in",
                });
            }
        } catch (error: unknown) {
            setAlert({
                variant: "destructive",
                type: "error",
                title: "Error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong during sign-in",
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
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>
                        Enter your email below to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={onSignIn}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 flex-col lg:flex-row">
                                <Button type="submit" className="w-full">
                                    Sign In
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <FaGoogle />
                                    Sign In with Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="underline underline-offset-4"
                            >
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
