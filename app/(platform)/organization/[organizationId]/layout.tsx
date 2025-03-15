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
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Extract breadcrumbs from URL path
    const breadcrumbs = useMemo(() => {
        // Skip empty segments and get parts after organization ID
        const segments = pathname.split("/").filter(Boolean);

        // Find the index of the organization ID segment
        const orgIdIndex = segments.findIndex(
            (segment) => segment === "organization"
        );

        // Get segments after the organization ID (skip organization and the ID itself)
        const relevantSegments = segments.slice(orgIdIndex + 2);

        if (relevantSegments.length === 0) {
            return [
                { label: "Dashboard", href: pathname, isCurrentPage: true },
            ];
        }

        // Transform segments into breadcrumb items
        return relevantSegments.map((segment, index) => {
            // Create path for this breadcrumb by joining all segments up to this point
            const segmentPath = segments
                .slice(0, orgIdIndex + 2 + index + 1)
                .join("/");
            const href = `/${segmentPath}`;

            // Format label to be more readable (capitalize first letter)
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);

            // Check if this is the current page (last segment)
            const isCurrentPage = index === relevantSegments.length - 1;

            return { label, href, isCurrentPage };
        });
    }, [pathname]);

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
