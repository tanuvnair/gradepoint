"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CircleAlert,
    CircleCheck,
    Link,
    PencilIcon,
    Trash,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserOrganizationDataResponse {
    userOrganizationInfo: {
        id: string;
        userId: string;
        organizationId: string;
        role: string;
    }[];
}

interface Organization {
    id: string;
    name: string;
    description?: string;
}

export default function OrganizationSettings() {
    const router = useRouter();
    const [userOrganizationData, setUserOrganizationData] =
        useState<UserOrganizationDataResponse | null>(null);
    const [organizationData, setOrganizationData] =
        useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [organizationName, setOrganizationName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("STUDENT"); // Default role
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const pathname = usePathname();
    const pathSegments = pathname.split("/");
    const organizationId = pathSegments[2];

    const [alertMessage, setAlertMessage] = useState<{
        type: "success" | "error" | null;
        message: string | null;
    }>({
        type: null,
        message: null,
    });

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const userRes = await fetch(
                    `/api/userOrganization/${organizationId}`
                );
                const userData = await userRes.json();
                setUserOrganizationData(userData);

                if (userData?.userOrganizationInfo?.length) {
                    const orgRes = await fetch(`/api/organization`);
                    const orgData = await orgRes.json();

                    if (
                        orgData?.success &&
                        Array.isArray(orgData.organizations)
                    ) {
                        const targetOrg = orgData.organizations.find(
                            (org: Organization) =>
                                org.id ===
                                userData.userOrganizationInfo[0]?.organizationId
                        );

                        if (targetOrg) {
                            setOrganizationData(targetOrg);
                            setOrganizationName(targetOrg.name);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [organizationId]);

    async function handleOrganizationNameChange() {
        try {
            const res = await fetch(`/api/organization/${organizationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: organizationName }),
            });
            if (!res.ok) throw new Error("Failed to update organization name");
            setAlertMessage({
                type: "success",
                message: "Organization name updated successfully.",
            });
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error as string,
            });
            console.error("Error updating organization name:", error);
        }
    }

    async function handleInviteByEmail() {
        if (!inviteEmail) {
            setAlertMessage({
                type: "error",
                message: "Please enter a valid email address.",
            });
            return;
        }

        try {
            const res = await fetch(
                `/api/organization/${organizationId}/invite`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: inviteEmail,
                        role: selectedRole,
                    }),
                }
            );

            if (!res.ok) {
                setAlertMessage({
                    type: "error",
                    message: "Failed to send invitation",
                });
            } else {
                setAlertMessage({
                    type: "success",
                    message: "Invitation sent successfully.",
                });
            }
            setInviteEmail(""); // Clear the input field after successful invitation
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error as string,
            });
            console.error("Error sending invitation:", error);
        }
    }

    async function handleDelete() {
        try {
            const res = await fetch(`/api/organization/${organizationId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.redirectTo) {
                router.replace(`/organization/${data.redirectTo}/dashboard`);
            } else {
                router.replace(`/organization/`);
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
        }
    }

    async function handleLeave() {
        try {
            const res = await fetch(`/api/organization/${organizationId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.redirectTo) {
                router.replace(`/organization/${data.redirectTo}/dashboard`);
            } else {
                router.replace(`/organization/`);
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
                <Skeleton className="h-9 w-72 mb-4" />{" "}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-5 w-32" />{" "}
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-full" />{" "}
                            <Skeleton className="h-10 w-24" />{" "}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-5 w-32" />{" "}
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-full" />{" "}
                            <Skeleton className="h-10 w-24" />{" "}
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />{" "}
                </div>
            </div>
        );
    }

    if (
        userOrganizationData?.userOrganizationInfo[0].role === "OWNER" ||
        userOrganizationData?.userOrganizationInfo[0].role === "ADMIN"
    ) {
        return (
            <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold border-b pb-4">
                    Organization Settings
                </h2>
                {alertMessage.type && (
                    <Alert
                        variant={
                            alertMessage.type === "success"
                                ? "default"
                                : "destructive"
                        }
                    >
                        <div className="flex items-center gap-3">
                            {alertMessage.type === "success" ? (
                                <CircleCheck />
                            ) : (
                                <CircleAlert />
                            )}
                            <div>
                                <AlertTitle>
                                    {alertMessage.type === "success"
                                        ? "Success"
                                        : "Error"}
                                </AlertTitle>
                                <AlertDescription>
                                    {alertMessage.message}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}
                <div className="flex flex-col gap-4">
                    <Label>Organization Name</Label>
                    <div className="flex gap-3">
                        <Input
                            className="w-full"
                            value={organizationName}
                            onChange={(e) =>
                                setOrganizationName(e.target.value)
                            }
                        />
                        <Button
                            variant="secondary"
                            onClick={handleOrganizationNameChange}
                        >
                            <PencilIcon /> Change
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Label>Invite Users</Label>
                    <div className="flex gap-3">
                        <Input
                            className="w-full"
                            type="email"
                            placeholder="Enter email to invite"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="INSTRUCTOR">
                                    Instructor
                                </SelectItem>
                                <SelectItem value="STUDENT">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="secondary"
                            onClick={handleInviteByEmail}
                        >
                            <Link />
                            Invite
                        </Button>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Trash /> Delete Organization
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                        </DialogHeader>
                        <p>
                            This action cannot be undone. Do you really want to
                            delete this organization?
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold border-b pb-4">
                    Organization Settings
                </h2>
                {alertMessage.type && (
                    <Alert
                        variant={
                            alertMessage.type === "success"
                                ? "default"
                                : "destructive"
                        }
                    >
                        <div className="flex items-center gap-3">
                            {alertMessage.type === "success" ? (
                                <CircleCheck />
                            ) : (
                                <CircleAlert />
                            )}
                            <div>
                                <AlertTitle>
                                    {alertMessage.type === "success"
                                        ? "Success"
                                        : "Error"}
                                </AlertTitle>
                                <AlertDescription>
                                    {alertMessage.message}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                <Button
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Trash /> Leave Organization
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                        </DialogHeader>
                        <p>
                            You will have to be invited back in. Do you really
                            want to leave this organization?
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleLeave}>
                                Leave
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}
