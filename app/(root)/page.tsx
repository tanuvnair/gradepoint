"use client";
import {
    AppWindow,
    ChartNoAxesCombined,
    Lock,
    MessageCircleQuestion,
    Presentation,
    Star,
} from "lucide-react";

import FeatureCard from "@/components/feature-card";
import Navbar from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
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

    const features = [
        {
            icon: AppWindow,
            title: "Modern Exam Interface",
            description:
                "Experience a sleek and intuitive interface designed to make taking exams seamless and stress-free.",
        },
        {
            icon: MessageCircleQuestion,
            title: "Real-Time Feedback",
            description:
                "Get instant feedback on your performance to help you improve and stay on track.",
        },
        {
            icon: Presentation,
            title: "Interactive Learning",
            description:
                "Engage with interactive questions to enhance your learning experience.",
        },
        {
            icon: Star,
            title: "Customizable Exams",
            description:
                "Create and customize exams tailored to your specific needs and preferences.",
        },
        {
            icon: ChartNoAxesCombined,
            title: "Progress Tracking",
            description:
                "Track your  progress over time with detailed analytics and insights.",
        },
        {
            icon: Lock,
            title: "Secure & Reliable",
            description:
                "Rest assured with our secure and reliable platform, ensuring your data is always safe.",
        },
    ];

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

                <div className="flex flex-col gap-24 lg:flex-row lg:gap-0 items-center justify-evenly w-full ">
                    {/* Left Section */}
                    <div className="flex flex-col items-left justify-center gap-6">
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-primary">
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
                            className="transition-all -rotate-3 hover:scale-105 hover:-rotate-6 max-w-xs md:max-w-sm lg:max-w-lg"
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
                <div className="container mx-auto px-4">
                    {/* Section Title */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary mb-16">
                        Features
                    </h2>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
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
