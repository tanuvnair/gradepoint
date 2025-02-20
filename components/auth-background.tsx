"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SignInBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            {mounted && (
                <Image
                    src={
                        theme === "dark"
                            ? "/signin-background-dark.svg"
                            : "/signin-background.svg"
                    }
                    alt="Background Image"
                    fill
                    style={{ objectFit: "cover" }}
                    quality={100}
                    priority
                />
            )}
        </div>
    );
}

export function SignUpBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            {mounted && (
                <Image
                    src={
                        theme === "dark"
                            ? "/signup-background-dark.svg"
                            : "/signup-background.svg"
                    }
                    alt="Background Image"
                    fill
                    style={{ objectFit: "cover" }}
                    quality={100}
                    priority
                />
            )}
        </div>
    );
}
