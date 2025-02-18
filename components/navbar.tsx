import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
    return (
        <header className="flex flex-row items-center justify-between p-6 m-4">
            <div>
                <a href="#home" className="text-2xl md:text-3xl font-semibold">
                    GradePoint
                </a>
            </div>
            <div className="hidden md:flex items-center gap-8 text-card-foreground">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#faqs">FAQs</a>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <span className="cursor-pointer">Pages</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem>
                            <a href="#about">About</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <a href="#contact">Contact</a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href="/signin"
                    className={buttonVariants({ variant: "link" })}
                >
                    Sign In
                </Link>
                <Button className="hidden md:block ml-2" variant={"secondary"}>
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
                                <Button className="w-full text-sm">
                                    Login
                                </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Button className="w-full text-sm">
                                    Get Started
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
