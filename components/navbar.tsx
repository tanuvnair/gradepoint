"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
    const router = useRouter();
    const navbarList = [
        "Features",
        "About Us",
        "FAQs",
        "Contact Us",
        "Report A Bug",
    ];

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const smoothScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <header
            className={`fixed w-full flex flex-row items-center justify-between p-4 md:p-6 lg:p-10 top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-background/95 shadow-lg backdrop-blur-sm"
                    : "bg-transparent shadow-none"
            }`}
        >
            {/* Logo */}
            <div>
                <a
                    href="#top"
                    className="text-xl md:text-2xl lg:text-3xl font-bold text-primary hover:opacity-75 hover:transition-all"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToTop();
                    }}
                >
                    GradePoint
                </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-24 text-card-foreground scroll-smooth">
                {navbarList.map((item, index) => (
                    <a
                        href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                        className={`text-accent-foreground font-semibold hover:transition-all hover:underline text-sm lg:text-base`}
                        key={index}
                        onClick={(e) => {
                            e.preventDefault();
                            const id = item.toLowerCase().replace(/\s+/g, "");
                            smoothScroll(id);
                        }}
                    >
                        {item}
                    </a>
                ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-6">
                <Button
                    variant={"ghost"}
                    onClick={() => router.push("/signin")}
                >
                    Sign In
                </Button>
                <Button
                    variant={"default"}
                    onClick={() => router.push("/signup")}
                >
                    Get Started
                </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {navbarList.map((item, index) => (
                            <DropdownMenuItem key={index}>
                                <a
                                    href={`#${item
                                        .toLowerCase()
                                        .replace(/\s+/g, "")}`}
                                    className="w-full"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const id = item
                                            .toLowerCase()
                                            .replace(/\s+/g, "");
                                        smoothScroll(id);
                                    }}
                                >
                                    {item}
                                </a>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem>
                            <Link href="/signin" className="w-full text-sm">
                                Sign In
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href="/signup" className="w-full text-sm">
                                Get Started
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Navbar;
