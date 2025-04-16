"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(true);
    const [examTitle, setExamTitle] = useState<string | null>(null);

    // Extract organization ID from pathname
    const organizationId = useMemo(() => {
        const segments = pathname.split("/");
        const orgIndex = segments.indexOf("organization");
        return segments[orgIndex + 1];
    }, [pathname]);

    // Extract exam ID from pathname if in exam edit route
    const examId = useMemo(() => {
        const segments = pathname.split("/");
        const examIndex = segments.indexOf("exams");
        if (examIndex !== -1 && segments[examIndex + 2] === "edit") {
            return segments[examIndex + 1];
        }
        return null;
    }, [pathname]);

    useEffect(() => {
        async function checkAccess() {
            try {
                const res = await fetch(`/api/userOrganization/${organizationId}`);
                const data = await res.json();

                if (!data?.userOrganizationInfo?.length) {
                    // User doesn't have access to this organization
                    setHasAccess(false);
                    window.location.href = '/organization';
                    return;
                }
                setHasAccess(true);
            } catch (error) {
                console.error("Error checking organization access:", error);
                setHasAccess(false);
                window.location.href = '/organization';
            } finally {
                setIsLoading(false);
            }
        }

        checkAccess();
    }, [organizationId]);

    // Fetch exam title when in exam edit route
    useEffect(() => {
        async function fetchExamTitle() {
            if (examId) {
                try {
                    const response = await fetch(`/api/organization/${organizationId}/exams/${examId}`);
                    if (response.ok) {
                        const exam = await response.json();
                        setExamTitle(exam.title);
                    }
                } catch (error) {
                    console.error("Error fetching exam title:", error);
                }
            }
        }

        fetchExamTitle();
    }, [examId, organizationId]);

    // Extract breadcrumbs from URL path
    const breadcrumbs = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        const orgIdIndex = segments.findIndex(segment => segment === "organization");
        const currentSegment = segments[orgIdIndex + 2] || "dashboard";

        let label = "Dashboard";
        if (currentSegment === "exams") {
            const subSegment = segments[orgIdIndex + 3];
            if (subSegment === "all") {
                label = "All Exams";
            } else if (subSegment === "history") {
                label = "Exam History";
            }
        } else if (currentSegment === "students") {
            label = "Student Performance";
        } else if (currentSegment === "settings") {
            label = "Settings";
        }

        return [{ label, href: pathname, isCurrentPage: true }];
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return null; // Will be redirected by the window.location.href
    }

    return (
        <div className="flex h-screen">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={crumb.href}>
                                            <BreadcrumbItem>
                                                {crumb.isCurrentPage ? (
                                                    <BreadcrumbPage>
                                                        {crumb.label}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <span>{crumb.label}</span>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
