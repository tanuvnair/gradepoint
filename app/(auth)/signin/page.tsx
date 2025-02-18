import { auth } from "@/auth";
import { SignInForm } from "@/components/signin-form";
import { redirect } from "next/navigation";

export default async function SignIn() {
    const session = await auth();
    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignInForm />
            </div>
        </div>
    );
}
