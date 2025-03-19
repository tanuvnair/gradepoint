"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

    const pathname = usePathname();
    const pathSegments = pathname.split("/");
    const organizationId = pathSegments[2];

    async function getUserOrganizationData() {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/userOrganization/${organizationId}`);
            const data = await res.json();
            setUserOrganizationData(data);
        } catch (error) {
            console.error("Error fetching user organizations:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function getOrganizationData() {
        if (!userOrganizationData) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/organization`);
            const data = await res.json();

            // Ensure the response structure is correct
            if (!data?.success || !Array.isArray(data.organizations)) {
                console.error("Unexpected API response:", data);
                return;
            }

            // Find the organization that matches the user's organizationId
            const targetOrg = data.organizations.find(
                (org: Organization) =>
                    org.id ===
                    userOrganizationData.userOrganizationInfo[0]?.organizationId
            );

            setOrganizationData(targetOrg || null);
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getUserOrganizationData();
    }, []);

    useEffect(() => {
        if (userOrganizationData) {
            getOrganizationData();
        }
    }, [userOrganizationData]);

    useEffect(() => {
        if (organizationData?.name) {
            setOrganizationName(organizationData.name);
        }
    }, [organizationData]);

    function handleOrganizationNameChange() {
        console.log(organizationName);
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

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 w-full p-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-8">
            <div className="flex flex-col gap-4">
                {JSON.stringify(userOrganizationData)}
                <br />
                <br />
                {JSON.stringify(organizationData)}
            </div>
            {userOrganizationData?.userOrganizationInfo[0]?.role === "OWNER" ? (
                <div className="flex gap-4">
                    <Input
                        value={organizationName}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => setOrganizationName(event.target.value)}
                    />
                    <Button
                        variant={"outline"}
                        onClick={handleOrganizationNameChange}
                    >
                        Change Name
                    </Button>
                    <Button variant={"destructive"} onClick={handleDelete}>
                        Delete Organization
                    </Button>
                </div>
            ) : (
                <div className="flex gap-4">
                    <Button variant={"destructive"}>Leave Organization</Button>
                </div>
            )}
        </div>
    );
}
