"use client";

import {
    BarChart2,
    GraduationCap,
    History,
    Settings2,
    Users
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
import { redirect, useParams } from "next/navigation";

function getNavItems(organizationId: string) {
    return [
        {
            title: "Dashboard",
            url: `/organization/${organizationId}/dashboard`,
            icon: BarChart2,
            isActive: false,
        },
        {
            title: "All Exams",
            url: `/organization/${organizationId}/exams/all`,
            icon: GraduationCap,
        },{
            title: "Exam History",
            url: `/organization/${organizationId}/exams/history`,
            icon: History,
        },
        {
            title: "Settings",
            url: `/organization/${organizationId}/settings`,
            icon: Settings2,
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
    role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
    const [organizations, setOrganizations] = useState<organization[]>([]);
    const [isLoading, setLoading] = useState(true);
    const params = useParams();
    const organizationId = params?.organizationId as string;

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/organization");
            const data = await res.json();
            setOrganizations(data.organizations);
        } catch (error) {
            console.log("Error fetching organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
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
                            redirect(`/organization/${id}/dashboard`);
                        }}
                        onRefetch={fetchOrganizations}
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
