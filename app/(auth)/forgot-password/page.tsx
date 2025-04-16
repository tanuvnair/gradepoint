import { SignInBackground } from "@/components/auth-background";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            {/* Background Image */}
            <SignInBackground />

            {/* Content */}
            <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary">
                        GradePoint
                    </h1>
                </Link>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Forgot Password
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
