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

    return (
        <header className="flex flex-row items-center justify-between p-8  sticky top-0 z-50 bg-white shadow-md">
            <div>
                <Link
                    href="/"
                    className="text-2xl md:text-3xl font-bold text-primary"
                >
                    GradePoint
                </Link>
            </div>
            <div className="hidden md:flex items-center gap-24 text-card-foreground">
                {navbarList.map((item, index) => (
                    <a
                        href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                        className={`font-semibold hover:transition-all hover:underline ${
                            selectedNavItem === item ? "underline" : ""
                        }`}
                        key={index}
                        onClick={() => setSelectedNavItem(item)}
                    >
                        {item}
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    className="hidden md:block ml-2"
                    variant={"link"}
                    onClick={() => router.push("/signin")}
                >
                    Sign In
                </Button>
                <Button
                    className="hidden md:block ml-2"
                    variant={"default"}
                    onClick={() => router.push("/signup")}
                >
                    Get Started
                </Button>
                <div className="md:hidden flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <a href="#features">Features</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a href="#pricing">Pricing</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a href="#faqs">FAQs</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link
                                    href="/signin"
                                    className="w-full text-sm block md:hidden"
                                >
                                    Sign In
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link
                                    href="/signup"
                                    className="w-full text-sm block md:hidden"
                                >
                                    Get Started
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
