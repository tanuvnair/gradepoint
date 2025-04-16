"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CircleAlert,
    CircleCheck,
    Link,
    PencilIcon,
    Search,
    Trash,
    UserX,
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

interface OrganizationUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
    role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

export default function OrganizationSettings() {
    const router = useRouter();
    const [userOrganizationData, setUserOrganizationData] =
        useState<UserOrganizationDataResponse | null>(null);
    const [organizationData, setOrganizationData] =
        useState<Organization | null>(null);
    const [users, setUsers] = useState<OrganizationUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<OrganizationUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [organizationName, setOrganizationName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("STUDENT");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const [userToRemove, setUserToRemove] = useState<OrganizationUser | null>(
        null
    );
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

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

    const [currentUserInfo, setCurrentUserInfo] = useState<{
        id: string;
        role: string;
    } | null>(null);

    const fetchOrganizations = async () => {
        try {
            const res = await fetch("/api/organization");
            const data = await res.json();
            if (data?.success && Array.isArray(data.organizations)) {
                const targetOrg = data.organizations.find(
                    (org: Organization) => org.id === organizationId
                );
                if (targetOrg) {
                    setOrganizationData(targetOrg);
                    setOrganizationName(targetOrg.name);
                }
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        }
    };

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
                    setCurrentUserInfo({
                        id: userData.userOrganizationInfo[0].userId,
                        role: userData.userOrganizationInfo[0].role,
                    });

                    await fetchOrganizations();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [organizationId]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch(
                    `/api/userOrganization/${organizationId}/users`
                );
                const data = await res.json();
                if (data.users) {
                    setUsers(data.users);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }

        if (userOrganizationData?.userOrganizationInfo[0]) {
            fetchUsers();
        }
    }, [organizationId, userOrganizationData]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(
                (user) =>
                    (user.name && user.name.toLowerCase().includes(query)) ||
                    user.email.toLowerCase().includes(query) ||
                    user.role.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }

        setCurrentPage(1);
    }, [searchQuery, users]);

    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / pageSize)));
    }, [filteredUsers, pageSize]);

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredUsers.slice(startIndex, endIndex);
    };

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    };

    const renderRoleBadge = (role: string) => {
        return <Badge variant={"outline"}>{role}</Badge>;
    };

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    async function handleOrganizationNameChange() {
        try {
            const res = await fetch(`/api/organization/${organizationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: organizationName }),
            });
            if (!res.ok) throw new Error("Failed to update organization name");
            await fetchOrganizations();
            setAlertMessage({
                type: "success",
                message: "Organization name updated successfully.",
            });
            // Trigger organization switcher refresh
            window.dispatchEvent(new CustomEvent('organization-refresh'));
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
            setInviteEmail("");
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

    const handleRoleChange = async (userId: string, newRole: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT") => {
        try {
            const res = await fetch(`/api/userOrganization/${organizationId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, newRole }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update role");
            }

            // Update the local state to reflect the change
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );

            setAlertMessage({
                type: "success",
                message: "User role updated successfully.",
            });
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to update role",
            });
        }
    };

    const confirmRemoveUser = (user: OrganizationUser) => {
        setUserToRemove(user);
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveUser = async () => {
        if (!userToRemove) return;

        try {
            const res = await fetch(`/api/userOrganization/${organizationId}/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userToRemove.id }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to remove user');
            }

            // If it's a redirect response (status 302)
            if (res.status === 302) {
                const redirectUrl = res.headers.get('Location');
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                    return;
                }
            }

            const data = await res.json();

            // Update the local state to remove the user
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userToRemove.id));
            setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userToRemove.id));

            setAlertMessage({
                type: "success",
                message: `User ${userToRemove.name || userToRemove.email} has been removed from the organization.`,
            });
        } catch (error) {
            setAlertMessage({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to remove user",
            });
        } finally {
            setIsRemoveDialogOpen(false);
            setUserToRemove(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-8 w-full max-w-2xl mx-auto">
                <Skeleton className="h-9 w-72 mb-4" />
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    const renderSearch = () => {
        return (
            <div className="flex items-center mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-20 ml-2">
                        <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    };

    const renderPagination = () => {
        return (
            <div className="flex items-center justify-end space-x-2 py-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing{" "}
                    {filteredUsers.length > 0
                        ? (currentPage - 1) * pageSize + 1
                        : 0}
                    -{Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                    {filteredUsers.length}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderUserTable = (isAdmin: boolean) => {
        return (
            <>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                {isAdmin && (
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getCurrentPageData().length > 0 ? (
                                getCurrentPageData().map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={
                                                        user.image || undefined
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>
                                                {user.name || "Unknown"}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {isAdmin ? (
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(value) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            value as "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT"
                                                        )
                                                    }
                                                    disabled={
                                                        user.role === "OWNER"
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="OWNER"
                                                            disabled
                                                        >
                                                            OWNER
                                                        </SelectItem>
                                                        <SelectItem value="ADMIN">
                                                            ADMIN
                                                        </SelectItem>
                                                        <SelectItem value="INSTRUCTOR">
                                                            INSTRUCTOR
                                                        </SelectItem>
                                                        <SelectItem value="STUDENT">
                                                            STUDENT
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                renderRoleBadge(user.role)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                {user.role !== "OWNER" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            confirmRemoveUser(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        <UserX />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={isAdmin ? 5 : 4}
                                        className="h-24 text-center"
                                    >
                                        {searchQuery.trim()
                                            ? "No members match your search"
                                            : "No members found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {renderPagination()}
            </>
        );
    };

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
                            <PencilIcon className="mr-2 h-4 w-4" /> Change
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
                            <Link className="mr-2 h-4 w-4" />
                            Invite
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Label>Organization Members</Label>

                    {renderSearch()}
                    {renderUserTable(true)}
                </div>

                <Button
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Trash className="mr-2 h-4 w-4" />{" "}
                    {userOrganizationData?.userOrganizationInfo[0].role ===
                    "OWNER"
                        ? "Delete"
                        : "Leave"}{" "}
                    Organization
                </Button>

                {userToRemove && (
                    <Dialog
                        open={isRemoveDialogOpen}
                        onOpenChange={setIsRemoveDialogOpen}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Remove User</DialogTitle>
                            </DialogHeader>
                            <p>
                                Are you sure you want to remove{" "}
                                {userToRemove.name || userToRemove.email} from
                                this organization?
                            </p>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRemoveDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleRemoveUser}
                                >
                                    Remove User
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

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
                                {userOrganizationData?.userOrganizationInfo[0]
                                    .role === "OWNER"
                                    ? "Delete"
                                    : "Leave"}
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

                <div className="flex flex-col gap-4">
                    <Label>Organization Members</Label>
                    {renderSearch()}
                    {renderUserTable(false)}
                </div>

                <Button
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Trash className="mr-2 h-4 w-4" /> Leave Organization
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
