"use client";

import { Toaster } from "@/components/ui/sonner";
import {
    Building,
    ChevronsUpDown,
    Home,
    Loader2,
    Plus,
    UserPlus,
    Users,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { ORGANIZATION_ICONS } from "@/lib/types";

export function OrganizationSwitcher({
    organizations,
    currentOrganizationId,
    onOrganizationChange,
}: {
    organizations: {
        id: string;
        icon: string;
        name: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    currentOrganizationId: string;
    onOrganizationChange: (id: string) => void;
}) {
    const { isMobile } = useSidebar();
    const [activeOrganization, setActiveOrganization] = React.useState(
        organizations.find((org) => org.id === currentOrganizationId) ||
            organizations[0]
    );
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [organizationName, setOrganizationName] = React.useState("");
    const [selectedIcon, setSelectedIcon] = React.useState("Building");
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
    const [inviteCode, setInviteCode] = React.useState("");
    const [isJoining, setIsJoining] = React.useState(false);

    const iconMap: Record<string, React.ElementType> = {
        Home: Home,
        Building: Building,
        Users: Users,
    };
    const IconComponent = iconMap[activeOrganization.icon] || Home;

    React.useEffect(() => {
        const newActiveOrg = organizations.find(
            (org) => org.id === currentOrganizationId
        );
        if (newActiveOrg) {
            setActiveOrganization(newActiveOrg);
        }
    }, [currentOrganizationId, organizations]);

    const handleCreateOrganization = async () => {
        if (!organizationName.trim()) {
            setError("Organization name is required");
            return;
        }

        try {
            setIsCreating(true);
            const response = await fetch("/api/organization", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: organizationName,
                    icon: selectedIcon,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                const errorMessage =
                    errorResponse.error || "Failed to create organization";
                throw new Error(errorMessage);
            }

            const newOrgResponse = await response.json();
            const createdOrg =
                newOrgResponse.organization ||
                newOrgResponse.data ||
                newOrgResponse;

            if (!createdOrg || !createdOrg.id || !createdOrg.name) {
                throw new Error("Invalid organization response");
            }

            console.log("New organization created:", createdOrg);

            setOrganizationName("");
            setError(null);
            setIsDialogOpen(false);

            toast.success("Organization Created", {
                description: `"${createdOrg.name}" has been successfully created.`,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinOrganization = async () => {
        if (!inviteCode.trim() || inviteCode.length !== 6) {
            setError("Please enter a valid 6-digit join code");
            return;
        }

        try {
            setIsJoining(true);
            const response = await fetch("/api/organization/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: inviteCode,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                const errorMessage =
                    errorResponse.error || "Failed to join organization";
                throw new Error(errorMessage);
            }

            const joinedOrgResponse = await response.json();
            const joinedOrg =
                joinedOrgResponse.organization ||
                joinedOrgResponse.data ||
                joinedOrgResponse;

            if (!joinedOrg || !joinedOrg.id || !joinedOrg.name) {
                throw new Error("Invalid organization response");
            }

            setInviteCode("");
            setError(null);
            setIsJoinDialogOpen(false);

            toast.success("Organization Joined", {
                description: `You have successfully joined "${joinedOrg.name}".`,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    const renderIconGrid = () => (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {ORGANIZATION_ICONS.map((iconItem) => {
                const Icon = iconItem.icon;
                return (
                    <Button
                        key={iconItem.name}
                        type="button"
                        variant={
                            selectedIcon === iconItem.name
                                ? "default"
                                : "outline"
                        }
                        size="icon"
                        className="aspect-square w-full p-0"
                        onClick={() => setSelectedIcon(iconItem.name)}
                    >
                        <Icon className="h-5 w-5" />
                    </Button>
                );
            })}
        </div>
    );

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
                                    key={organization.id}
                                    onClick={() => {
                                        setActiveOrganization(organization);
                                        onOrganizationChange(organization.id);
                                    }}
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
                                    e.preventDefault();
                                    setIsDialogOpen(true);
                                    setError(null);
                                    setOrganizationName("");
                                }}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Create Organization
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setIsJoinDialogOpen(true);
                                    setError(null);
                                    setInviteCode("");
                                }}
                            >
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

            {/* Create Organization Dialog */}
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
                            <Label htmlFor="organizationName">
                                Organization Name
                            </Label>
                            <Input
                                id="organizationName"
                                className="col-span-3"
                                value={organizationName}
                                onChange={(e) =>
                                    setOrganizationName(e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Select Icon</Label>
                            {renderIconGrid()}
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCreateOrganization}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Organization"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Join Organization Dialog */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogContent className="w-[95%] max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Enter Invitation Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8">
                        {error && (
                            <p className="text-red-500 text-sm ">{error}</p>
                        )}
                        <div className="flex flex-col gap-4">
                            <InputOTP
                                maxLength={6}
                                value={inviteCode}
                                onChange={(value) => setInviteCode(value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            onClick={handleJoinOrganization}
                            disabled={isJoining}
                            className="w-full"
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Join"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    );
}
