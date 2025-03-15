"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { ORGANIZATION_ICONS } from "@/lib/types";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    GalleryVerticalEnd,
    Loader2,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Organization {
    id: string;
    name: string;
    icon: string;
}

interface OrganizationResponse {
    organizations?: Organization[];
    data?: Organization[];
}

export default function OrganizationSelection() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [orgName, setOrgName] = useState<string>("");
    const [selectedIcon, setSelectedIcon] = useState<string>("Building");
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const response = await fetch("/api/organization");
                if (!response.ok) {
                    throw new Error("Failed to fetch organizations");
                }

                const data: OrganizationResponse = await response.json();

                const orgs: Organization[] = Array.isArray(data)
                    ? data
                    : data.organizations || data.data || [];

                const validOrgs = orgs.filter(
                    (org) =>
                        org &&
                        typeof org.id === "string" &&
                        typeof org.name === "string" &&
                        typeof org.icon === "string"
                );

                setOrganizations(validOrgs);
                setIsLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                );
                setIsLoading(false);
                setOrganizations([]);
            }
        }

        fetchOrganizations();
    }, []);

    const handleCreateOrganization = async () => {
        if (!orgName.trim()) {
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
                    name: orgName,
                    icon: selectedIcon,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create organization");
            }

            const newOrgResponse = await response.json();

            const createdOrg: Organization =
                newOrgResponse.organization ||
                newOrgResponse.data ||
                newOrgResponse;

            if (!createdOrg || !createdOrg.id || !createdOrg.name) {
                throw new Error("Invalid organization response");
            }

            setOrganizations((prev) => [...prev, createdOrg]);
            setSelectedOrg(createdOrg);
            setOrgName("");
            setError(null);
            setIsDialogOpen(false);

            toast.success("Organization Created", {
                description: `"${createdOrg.name}" has been successfully created.`,
            });
        } catch (err) {
            console.error("Create org error:", err);
            setError(
                err instanceof Error ? err.message : "An unknown error occurred"
            );
            toast.error("Error Creating Organization", {
                description: error || "An unexpected error occurred",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleGoToDashboard = () => {
        if (selectedOrg) {
            router.push(`/organization/${selectedOrg.id}/dashboard`);
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center min-h-screen w-full p-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                        GradePoint
                    </h1>
                </Link>
                <div className="text-center space-y-6 max-w-md w-full p-4 sm:p-6">
                    <Building2 className="h-16 w-16 sm:h-20 sm:w-20 mx-auto opacity-50" />
                    <h2 className="text-2xl sm:text-3xl font-semibold">
                        Create Your Organization
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        You don't have any organizations yet. Let's create your
                        first one.
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Create
                                Organization
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95%] max-w-md rounded-lg">
                            <DialogHeader>
                                <DialogTitle>New Organization</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Organization Name"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                                {renderIconGrid()}
                                {error && (
                                    <p className="text-red-500 text-sm text-center">
                                        {error}
                                    </p>
                                )}
                                <Button
                                    onClick={handleCreateOrganization}
                                    disabled={isCreating}
                                    className="w-full"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Toaster />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen w-full p-4">
            <Link
                href="/"
                className="flex items-center gap-2 self-center font-medium"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                    GradePoint
                </h1>
            </Link>
            <div className="space-y-6 w-full max-w-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-center">
                    Select Organization
                </h2>
                <Select
                    value={selectedOrg?.id}
                    onValueChange={(value) => {
                        const org = organizations.find((o) => o.id === value);
                        setSelectedOrg(org || null);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select organization">
                            {selectedOrg ? (
                                <div className="flex items-center">
                                    {(() => {
                                        const IconComponent =
                                            ORGANIZATION_ICONS.find(
                                                (i) =>
                                                    i.name === selectedOrg.icon
                                            )?.icon || Building2;
                                        return (
                                            <IconComponent className="h-4 w-4 mr-2" />
                                        );
                                    })()}
                                    {selectedOrg.name}
                                </div>
                            ) : (
                                "Select organization"
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {organizations.map((org) => {
                            const IconComponent =
                                ORGANIZATION_ICONS.find(
                                    (i) => i.name === org.icon
                                )?.icon || Building2;
                            return (
                                <SelectItem
                                    key={org.id}
                                    value={org.id}
                                    className="flex items-center"
                                >
                                    <div className="flex items-center">
                                        <IconComponent className="h-4 w-4 mr-2" />
                                        {org.name}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                <div className="flex flex-col space-y-4 mt-4">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Create
                                Organization
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-[95%] max-w-md rounded-lg">
                            <DialogHeader>
                                <DialogTitle>Create Organization</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Organization Name"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                                {renderIconGrid()}
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle />
                                        <div className="ml-2 mt-1">
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>
                                                {error}
                                            </AlertDescription>
                                        </div>
                                    </Alert>
                                )}{" "}
                                <Button
                                    onClick={handleCreateOrganization}
                                    disabled={isCreating}
                                    className="w-full"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button
                        onClick={handleGoToDashboard}
                        disabled={!selectedOrg}
                        className="w-full"
                    >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Toaster />
                </div>
            </div>
        </div>
    );
}
