"use client";

import {
    BarChart2,
    BookOpen,
    Building2,
    Calendar,
    ClipboardList,
    GraduationCap,
    MessagesSquare,
    School,
    Settings2,
    Users,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton"; // Import a skeleton component
import { useSession } from "next-auth/react";

// This is sample data.

const data = {
    organizations: [
        {
            name: "Lincoln High School",
            logo: School,
            plan: "Institution",
        },
        {
            name: "Springfield Academy",
            logo: Building2,
            plan: "Institution",
        },
        {
            name: "Central District",
            logo: School,
            plan: "District",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: BarChart2,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/dashboard/overview",
                },
                {
                    title: "Analytics",
                    url: "/dashboard/analytics",
                },
                {
                    title: "Reports",
                    url: "/dashboard/reports",
                },
            ],
        },
        {
            title: "Classes",
            url: "/classes",
            icon: GraduationCap,
            items: [
                {
                    title: "All Classes",
                    url: "/classes/all",
                },
                {
                    title: "Grade Books",
                    url: "/classes/gradebooks",
                },
                {
                    title: "Assignments",
                    url: "/classes/assignments",
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
                },
                {
                    title: "Performance",
                    url: "/students/performance",
                },
                {
                    title: "Attendance",
                    url: "/students/attendance",
                },
            ],
        },
        {
            title: "Calendar",
            url: "/calendar",
            icon: Calendar,
            items: [
                {
                    title: "Schedule",
                    url: "/calendar/schedule",
                },
                {
                    title: "Events",
                    url: "/calendar/events",
                },
                {
                    title: "Academic Year",
                    url: "/calendar/academic-year",
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
                },
                {
                    title: "Materials",
                    url: "/resources/materials",
                },
                {
                    title: "Help Center",
                    url: "/resources/help",
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
                },
                {
                    title: "Organization",
                    url: "/settings/organization",
                },
                {
                    title: "Permissions",
                    url: "/settings/permissions",
                },
            ],
        },
    ],
    quickAccess: [
        {
            name: "Grade Entry",
            url: "/quick/grades",
            icon: ClipboardList,
        },
        {
            name: "Messages",
            url: "/quick/messages",
            icon: MessagesSquare,
        },
        {
            name: "Reports",
            url: "/quick/reports",
            icon: BarChart2,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.organizations} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.quickAccess} />
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
