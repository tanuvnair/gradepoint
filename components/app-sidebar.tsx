"use client";

import {
    BarChart2,
    BookOpen,
    GraduationCap,
    Settings2,
    Users,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

function getNavItems(organizationId: string) {
    return [
        {
            title: "Dashboard",
            url: `/organization/${organizationId}/dashboard`,
            icon: BarChart2,
            isActive: false,
        },
        {
            title: "Exams",
            url: `/organization/${organizationId}/exams`,
            icon: GraduationCap,
            items: [
                {
                    title: "All Exams",
                    url: `/organization/${organizationId}/exams/all`,
                    isActive: false,
                },
                {
                    title: "Exam History",
                    url: `/organization/${organizationId}/exams/history`,
                    isActive: false,
                },
            ],
        },
        {
            title: "Students",
            url: `/organization/${organizationId}/students`,
            icon: Users,
            items: [
                {
                    title: "Directory",
                    url: `/organization/${organizationId}/students/directory`,
                    isActive: false,
                },
                {
                    title: "Performance",
                    url: `/organization/${organizationId}/students/performance`,
                    isActive: false,
                },
                {
                    title: "Attendance",
                    url: `/organization/${organizationId}/students/attendance`,
                    isActive: false,
                },
            ],
        },
        {
            title: "Resources",
            url: `/organization/${organizationId}/resources`,
            icon: BookOpen,
            items: [
                {
                    title: "Materials",
                    url: `/organization/${organizationId}/resources/materials`,
                    isActive: false,
                },
                {
                    title: "Help Center",
                    url: `/organization/${organizationId}/resources/help`,
                    isActive: false,
                },
            ],
        },
        {
            title: "Settings",
            url: `/organization/${organizationId}/settings`,
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: `/organization/${organizationId}/settings/general`,
                    isActive: false,
                },
                {
                    title: "Organization",
                    url: `/organization/${organizationId}/settings/organization`,
                    isActive: false,
                },
                {
                    title: "Permissions",
                    url: `/organization/${organizationId}/settings/permissions`,
                    isActive: false,
                },
            ],
        },
    ];
}

type organization = {
    id: string;
    icon: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
    const [organizations, setOrganizations] = useState<organization[]>([]);
    const [isLoading, setLoading] = useState(true);
    const params = useParams();
    const organizationId = params?.organizationId as string;
    const router = useRouter();

    useEffect(() => {
        fetch("/api/organization")
            .then((res) => res.json())
            .then((data) => {
                setOrganizations(data.organizations);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching organizations:", error);
                setLoading(false);
            });
    }, []);

    const navItems = organizationId ? getNavItems(organizationId) : [];

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                {isLoading ? (
                    <div className="flex items-center gap-2 p-1">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col">
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ) : organizations ? (
                    <OrganizationSwitcher
                        organizations={organizations}
                        currentOrganizationId={organizationId}
                        onOrganizationChange={(id) => {
                            router.push(`/organization/${id}/dashboard`);
                        }}
                    />
                ) : (
                    <p>Create an organization</p>
                )}
            </SidebarHeader>
            <SidebarContent>
                {organizationId ? (
                    <NavMain items={navItems} />
                ) : (
                    <div className="p-4 text-sm text-muted-foreground">
                        Please select an organization
                    </div>
                )}
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
