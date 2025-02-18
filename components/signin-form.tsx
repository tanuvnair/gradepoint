"use client";

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
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export function SignInForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>
                        Enter your email below to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
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
                                    type="password"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 flex-col lg:flex-row">
                                <Button type="submit" className="w-full">
                                    Sign In
                                </Button>
                                <Button variant="outline" className="w-full">
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
