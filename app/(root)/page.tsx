"use client";

import FAQSection from "@/components/faq-section";
import FeatureSection from "@/components/feature-section";
import Navbar from "@/components/navbar";
import ReportABugSection from "@/components/report-a-bug-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { Separator } from "@/components/ui/separator";
import { ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const heroSectionRef = useRef<HTMLElement>(null);
    const words = ["better", "fun", "modern", "interactive"];

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
        <div className="flex flex-col items-center">
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

                <div className="flex flex-col gap-24 lg:flex-row lg:gap-8 items-center justify-evenly w-full ">
                    {/* Left Section */}
                    <div className="flex flex-col items-left justify-center gap-6">
                        <h1 className="text-6xl md:text-6xl lg:text-7xl font-bold text-primary">
                            GradePoint
                        </h1>

                        <div className="text-5xl font-normal text-neutral-600 dark:text-neutral-400">
                            The
                            <FlipWords words={words} /> <br />
                            way to take exams
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center justify-center">
                        <Image
                            src="/landing-image.svg"
                            alt="landing-image"
                            className="transition-all -rotate-3 hover:scale-105 hover:-rotate-6 max-w-xs md:max-w-md lg:max-w-md"
                            width={800}
                            height={800}
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Other Sections */}
            <section
                id="features"
                className="min-h-screen w-full flex flex-col items-center justify-center bg-background py-20"
            >
                <FeatureSection />
            </section>
            <Separator className=" w-1/2" />
            <section
                id="faqs"
                className="min-h-screen w-full flex flex-col items-center justify-center bg-background py-20"
            >
                <FAQSection />
            </section>
            <Separator className=" w-1/2" />
            <section
                id="reportabug"
                className="min-h-screen w-full bg-blue-400 flex items-center justify-center text-white text-2xl"
            >
                <ReportABugSection />
            </section>

            <div className="flex flex-col gap-3 items-center fixed bottom-8 right-8">
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
