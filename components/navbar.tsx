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
import { useState } from "react";

const Navbar = () => {
    const router = useRouter();
    const navbarList = [
        "Features",
        "About Us",
        "FAQs",
        "Contact Us",
        "Report A Bug",
    ];

    const [selectedNavItem, setSelectedNavItem] = useState(navbarList[0]);

    // Smooth scroll function
    const smoothScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start", // Aligns the element to the top of the viewport
            });
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <header className="flex flex-row items-center justify-between p-6 md:p-10 sticky top-0 z-50 bg-background shadow-lg">
            {/* Logo */}
            <div>
                <a
                    href="#top"
                    className="text-2xl md:text-3xl font-bold text-primary hover:text-secondary hover:transition-all"
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default anchor behavior
                        scrollToTop(); // Smooth scroll to the top
                    }}
                >
                    GradePoint
                </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-24 text-card-foreground scroll-smooth">
                {navbarList.map((item, index) => (
                    <a
                        href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                        className={`font-semibold hover:transition-all hover:underline`}
                        key={index}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent default anchor behavior
                            const id = item.toLowerCase().replace(/\s+/g, "");
                            smoothScroll(id); // Smooth scroll to the target section
                            setSelectedNavItem(item); // Update selected nav item
                        }}
                    >
                        {item}
                    </a>
                ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2">
                <Button variant={"link"} onClick={() => router.push("/signin")}>
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
                                        e.preventDefault(); // Prevent default anchor behavior
                                        const id = item
                                            .toLowerCase()
                                            .replace(/\s+/g, "");
                                        smoothScroll(id); // Smooth scroll to the target section
                                        setSelectedNavItem(item); // Update selected nav item
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
