"use client";

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
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { ORGANIZATION_ICONS } from "@/lib/types";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
    Building2,
    GalleryVerticalEnd,
    Loader2,
    LogOut,
    Plus,
    UserPlus,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    const { data: session } = useSession();
    const { toast } = useToast();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [organizationName, setOrganizationName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [selectedIcon, setSelectedIcon] = useState<string>("Building");
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] =
        useState<boolean>(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState<boolean>(false);
    const [isResending, setIsResending] = useState(false);

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
            setOrganizationName("");
            setError(null);
            setIsCreateDialogOpen(false);
        } catch (err) {
            console.error("Create org error:", err);
            setError(
                err instanceof Error ? err.message : "An unknown error occurred"
            );
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
                throw new Error("Failed to join organization");
            }

            const joinedOrgResponse = await response.json();

            const joinedOrg: Organization =
                joinedOrgResponse.organization ||
                joinedOrgResponse.data ||
                joinedOrgResponse;

            if (!joinedOrg || !joinedOrg.id || !joinedOrg.name) {
                throw new Error("Invalid organization response");
            }

            setOrganizations((prev) => [...prev, joinedOrg]);
            setInviteCode("");
            setError(null);
            setIsJoinDialogOpen(false);
        } catch (err) {
            console.error("Join org error:", err);
            setError(
                err instanceof Error ? err.message : "An unknown error occurred"
            );
        } finally {
            setIsJoining(false);
        }
    };

    async function getFirstOrganization() {
        try {
            const response = await fetch("/api/organization");
            if (!response.ok) {
                throw new Error("Failed to fetch organizations");
            }

            const data = await response.json();

            return data.organizations.length > 0 ? data.organizations[0] : null;
        } catch (error) {
            console.error("Error fetching organization:", error);
            return null;
        }
    }

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

    const handleResendVerification = async () => {
        try {
            setIsResending(true);
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to resend verification email");
            }

            toast({
                title: "Success",
                description: "Verification email sent successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to resend verification email",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

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
                {!session?.user?.emailVerified && (
                    <div className="w-full max-w-md mb-4 p-4 bg-primary/10 border border-primary/20 text-primary rounded-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-primary/20 p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium">
                                    Please verify your email to access all features
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResendVerification}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Sending...
                                    </>
                                ) : (
                                    "Resend"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
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
                        Create/Join an Organization
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        {`You are not part of any organizations yet. You may create one or join one.`}
                    </p>
                    <div className="space-y-4">
                        <Dialog
                            open={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        setError(null);
                                        setOrganizationName("");
                                    }}
                                >
                                    <Plus /> Create Organization
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95%] max-w-md rounded-lg">
                                <DialogHeader>
                                    <DialogTitle>New Organization</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {error && (
                                        <p className="text-red-500 text-sm">
                                            {error}
                                        </p>
                                    )}
                                    <Input
                                        placeholder="Organization Name"
                                        value={organizationName}
                                        onChange={(e) =>
                                            setOrganizationName(e.target.value)
                                        }
                                    />
                                    {renderIconGrid()}

                                    <Button
                                        onClick={handleCreateOrganization}
                                        disabled={isCreating}
                                        className="w-full"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create"
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog
                            open={isJoinDialogOpen}
                            onOpenChange={setIsJoinDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => {
                                        setError(null);
                                        setInviteCode("");
                                    }}
                                >
                                    <UserPlus />
                                    Join Organization
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95%] max-w-md rounded-lg">
                                <DialogHeader>
                                    <DialogTitle>
                                        Enter Invitation Code
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-8">
                                    {error && (
                                        <p className="text-red-500 text-sm ">
                                            {error}
                                        </p>
                                    )}
                                    <div className="flex flex-col gap-4">
                                        <InputOTP
                                            maxLength={6}
                                            value={inviteCode}
                                            onChange={(value) =>
                                                setInviteCode(value)
                                            }
                                            pattern={
                                                REGEXP_ONLY_DIGITS_AND_CHARS
                                            }
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
                    </div>
                    <div className="pt-4">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        );
    } else {
        getFirstOrganization()
            .then((org) => router.push(`/organization/${org.id}/dashboard`))
            .catch((error) =>
                console.error("Error fetching organization:", error)
            );
    }
}
