import { auth } from "@/auth";
import { SignUpBackground } from "@/components/auth-background";
import { SignUpForm } from "@/components/signup-form";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignIn() {
    const session = await auth();
    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            {/* Background Image */}
            <SignUpBackground />

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
                <SignUpForm />
            </div>
        </div>
    );
}
