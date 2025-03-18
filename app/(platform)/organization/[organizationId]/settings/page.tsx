"use client";

import { useEffect, useState } from "react";

export default function OrganizationSettings() {
    const [organizationData, setOrganizationData] = useState();

    async function getOrganizationData() {
        fetch("/api/organization/a841155c-eb08-4169-86c8-b069878aa029")
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

    return <div>{JSON.stringify(organizationData)}</div>;
}
