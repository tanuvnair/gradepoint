"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("error");
                setMessage("No verification token provided");
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully!");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Failed to verify email");
                }
            } catch (error) {
                setStatus("error");
                setMessage("An error occurred while verifying your email");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                        {status === "loading" && "Verifying your email..."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "loading" && (
                        <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    )}

                    {status === "success" && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                            <div className="mt-4">
                                <Link href="/signin" className="text-primary hover:underline">
                                    Proceed to Sign In
                                </Link>
                            </div>
                        </Alert>
                    )}

                    {status === "error" && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                            <div className="mt-4">
                                <Link href="/signin" className="text-primary hover:underline">
                                    Return to Sign In
                                </Link>
                            </div>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
