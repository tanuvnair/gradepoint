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
import { AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

interface ErrorMessages {
    [key: string]: string;
}

const errors: ErrorMessages = {
    Signin: "Try signing with a different account.",
    OAuthSignin: "Try signing with a different account.",
    OAuthCallback: "Try signing with a different account.",
    OAuthCreateAccount: "Try signing with a different account.",
    EmailCreateAccount: "Try signing with a different account.",
    Callback: "Try signing with a different account.",
    OAuthAccountNotLinked:
        "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "Check your email address.",
    CredentialsSignin:
        "Sign in failed. Check the details you provided are correct.",
    default: "Unable to sign in.",
};

export function SignInForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    async function onSignIn(formData: FormData) {
        try {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            await signIn("credentials", {
                email,
                password,
            });
        } catch (error: unknown) {
            console.log(error);
        }
    }

    const SignInError = ({ error }: { error?: string }) => {
        const errorMessage = error && (errors[error] ?? errors.default);
        return <div>{errorMessage}</div>;
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {error && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <div className="ml-2 mt-1">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {<SignInError error={error} />}
                        </AlertDescription>
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
                                    onClick={() => signIn("google")}
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
