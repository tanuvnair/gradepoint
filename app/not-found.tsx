import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold text-primary">404</h1>
                <h2 className="text-3xl font-semibold">Page Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Button asChild variant="default">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </div>
    );
}
