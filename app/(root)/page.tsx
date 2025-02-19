"use client";

import Navbar from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const heroSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (heroSectionRef.current) {
                const heroSectionBottom =
                    heroSectionRef.current.getBoundingClientRect().bottom;
                setShowScrollToTop(heroSectionBottom <= 0);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

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
            <Navbar />

            {/* Hero Section */}
            <section
                id="top"
                ref={heroSectionRef}
                className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 -z-10">
                    {mounted && (
                        <Image
                            src={
                                theme === "dark"
                                    ? "/landing-bg-dark.svg"
                                    : "/landing-bg.svg"
                            }
                            alt="Background"
                            fill
                            style={{ objectFit: "cover" }}
                            priority
                        />
                    )}
                </div>

                <div className="text-center z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-accent-foreground">
                        Welcome to GradePoint
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-accent-foreground">
                        Your ultimate solution for academic success.
                    </p>
                </div>
            </section>

            {/* Other Sections */}
            <section
                id="features"
                className="min-h-screen w-full bg-purple-500 flex items-center justify-center text-foreground text-2xl"
            >
                Features Section
            </section>
            <section
                id="aboutus"
                className="min-h-screen w-full bg-gray-800 flex items-center justify-center text-white text-2xl"
            >
                About Section
            </section>
            <section
                id="faqs"
                className="min-h-screen w-full bg-purple-500 flex items-center justify-center text-white text-2xl"
            >
                FAQs Section
            </section>
            <section
                id="contactus"
                className="min-h-screen w-full bg-green-500 flex items-center justify-center text-white text-2xl"
            >
                Contact Section
            </section>
            <section
                id="reportabug"
                className="min-h-screen w-full bg-blue-400 flex items-center justify-center text-white text-2xl"
            >
                Report a Bug Section
            </section>

            <div className="flex flex-col gap-4 items-center fixed bottom-8 right-8">
                {/* Scroll-to-Top Button */}
                <Button
                    variant={"default"}
                    onClick={scrollToTop}
                    className={`px-6 py-8 rounded-full transition-all duration-300 ${
                        showScrollToTop
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                >
                    <ArrowUp className="h-8 w-8" />
                </Button>
                <ThemeToggle />
            </div>
        </div>
    );
}
