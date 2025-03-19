"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrganizationResponse {
    success: boolean;
    organizationInfo: {
        id: string;
        userId: string;
        organizationId: string;
        role: string;
    }[];
}

export default function OrganizationSettings() {
    const router = useRouter();
    const [organizationData, setOrganizationData] =
        useState<OrganizationResponse | null>(null);

    const pathname = usePathname();
    const pathSegments = pathname.split("/");
    const organizationId = pathSegments[2];

    async function getOrganizationData() {
        fetch(`/api/organization/${organizationId}`)
            .then((res) => res.json())
            .then((data) => {
                setOrganizationData(data);
            })
            .catch((error) => {
                console.error("Error fetching organizations:", error);
            });
    }
    // Somehow get the organizationId from the URL and then fetch the user role from the backend
    useEffect(() => {
        getOrganizationData();
    }, []);

    async function handleDelete() {
        console.log("DELETING");

        fetch(`/api/organization/${organizationId}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.redirectTo) {
                    router.replace(
                        `/organization/${data.redirectTo}/dashboard`
                    );
                } else {
                    router.replace(`/organization/`);
                }
            })
            .catch((error) => {
                console.error("Error deleting organization:", error);
            });
    }

    return (
        <div className="flex flex-col gap-2">
            {JSON.stringify(organizationData)}
            {organizationData?.organizationInfo[0].role === "OWNER" ? (
                <div className="flex gap-4">
                    <Button>Edit Organization</Button>
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
