"use client";

import {
    Building,
    ChevronsUpDown,
    Home,
    Plus,
    UserPlus,
    Users,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function OrganizationSwitcher({
    organizations,
}: {
    organizations: {
        id: string;
        icon: string;
        name: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
}) {
    const { isMobile } = useSidebar();
    const [activeOrganization, setactiveOrganization] = React.useState(
        organizations[0]
    );
    const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to control Dialog visibility
    const [organizationName, setOrganizationName] = React.useState("");
    const iconMap: Record<string, React.ElementType> = {
        Home: Home,
        Building: Building,
        Users: Users,
    };
    const IconComponent = iconMap[activeOrganization.icon] || Home;

    async function handleCreateOrganization() {
        console.log(organizationName);
        try {
            fetch("/api/organization", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    icon: "School",
                    name: organizationName,
                }),
            });
        } catch (error) {
            console.log("Something went wrong: ", error);
        }
    }

    return (
        <div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <IconComponent className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {activeOrganization.name}
                                    </span>
                                    {/* <span className="truncate text-xs">
                                        Created by {activeOrganization.owner}
                                    </span> */}
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Organizations
                            </DropdownMenuLabel>
                            {organizations.map((organization) => (
                                <DropdownMenuItem
                                    key={organization.name}
                                    onClick={() =>
                                        setactiveOrganization(organization)
                                    }
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <IconComponent className="size-4 shrink-0" />
                                    </div>
                                    {organization.name}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                onSelect={(e) => {
                                    e.preventDefault(); // Prevent default behavior
                                    setIsDialogOpen(true); // Open the Dialog
                                }}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Create Organization
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <UserPlus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Join Organization
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Organization</DialogTitle>
                        <DialogDescription>
                            Create your brand new organization here
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="organizationName"
                                className="col-span-3"
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setOrganizationName(event.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => handleCreateOrganization()}>
                            Create Organization
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
