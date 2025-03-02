"use client";

import {
    BarChart2,
    BookOpen,
    GraduationCap,
    Settings2,
    Users,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

// Static navigation data remains unchanged
const navMain = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart2,
        isActive: false,
        items: [
            {
                title: "Overview",
                url: "/dashboard/overview",
                isActive: false,
            },
            {
                title: "Analytics",
                url: "/dashboard/analytics",
                isActive: false,
            },
            {
                title: "Reports",
                url: "/dashboard/reports",
                isActive: false,
            },
        ],
    },
    {
        title: "Exams",
        url: "/exams",
        icon: GraduationCap,
        items: [
            {
                title: "All Exams",
                url: "/exams/all",
                isActive: false,
            },
            {
                title: "Exam History",
                url: "/exams/history",
                isActive: false,
            },
        ],
    },
    {
        title: "Students",
        url: "/students",
        icon: Users,
        items: [
            {
                title: "Directory",
                url: "/students/directory",
                isActive: false,
            },
            {
                title: "Performance",
                url: "/students/performance",
                isActive: false,
            },
            {
                title: "Attendance",
                url: "/students/attendance",
                isActive: false,
            },
        ],
    },
    {
        title: "Resources",
        url: "/resources",
        icon: BookOpen,
        items: [
            {
                title: "Library",
                url: "/resources/library",
                isActive: false,
            },
            {
                title: "Materials",
                url: "/resources/materials",
                isActive: false,
            },
            {
                title: "Help Center",
                url: "/resources/help",
                isActive: false,
            },
        ],
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
            {
                title: "General",
                url: "/settings/general",
                isActive: false,
            },
            {
                title: "Organization",
                url: "/settings/organization",
                isActive: false,
            },
            {
                title: "Permissions",
                url: "/settings/permissions",
                isActive: false,
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
    const [organizations, setOrganizations] = useState<any>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/organization")
            .then((res) => res.json())
            .then((data) => {
                setOrganizations(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching organizations:", error);
                setLoading(false);
            });
    }, []);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {isLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                ) : organizations ? (
                    <TeamSwitcher teams={organizations} />
                ) : (
                    <p>No organizations data</p>
                )}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                {status === "loading" ? (
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-3 w-[80px]" />
                        </div>
                    </div>
                ) : (
                    <NavUser
                        user={{
                            name: session?.user?.name || "User",
                            email: session?.user?.email || "user@example.com",
                            avatar:
                                session?.user?.image || "/avatars/default.jpg",
                        }}
                    />
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
