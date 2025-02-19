"use client";

import Navbar from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { FlipWords } from "@/components/ui/flip-words";
import { ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const heroSectionRef = useRef<HTMLElement>(null);
    const words = ["better", "cute", "beautiful", "modern"];

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

                <div className="flex flex-col gap-16 lg:flex-row lg:gap-0 items-center justify-evenly w-full ">
                    {/* Left Section */}
                    <div className="flex flex-col items-left justify-center gap-3">
                        <h1 className="text-4xl md:text-6xl font-bold text-accent-foreground">
                            GradePoint
                        </h1>

                        <div className="text-4xl font-normal text-neutral-600 dark:text-neutral-400">
                            The
                            <FlipWords words={words} /> <br />
                            way to take exams
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center justify-center">
                        <Carousel className="w-full max-w-xs md:max-w-s lg:max-w-lg">
                            <CarouselContent>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                                    <span className="text-4xl font-semibold">
                                                        {index + 1}
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
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
