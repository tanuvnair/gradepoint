"use client";

import Navbar from "@/components/navbar";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const heroSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (heroSectionRef.current) {
                const heroSectionBottom =
                    heroSectionRef.current.getBoundingClientRect().bottom;
                if (heroSectionBottom <= 0) {
                    setShowScrollToTop(true);
                } else {
                    setShowScrollToTop(false);
                }
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

    return (
        <div>
            <Navbar />
            {/* Hero Section */}
            <section
                id="top"
                ref={heroSectionRef}
                className="min-h-screen w-full flex items-center justify-center bg-purple-500"
            >
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">
                        Welcome to GradePoint
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-purple-100">
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

            {/* Scroll-to-Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 p-6 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 ${
                    showScrollToTop
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                <ArrowUp className="h-8 w-8" />
            </button>
        </div>
    );
}
