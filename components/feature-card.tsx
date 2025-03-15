"use client";

import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function FeatureCard({
    icon: Icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
                <Icon className="w-16 h-16 text-primary mb-6" />{" "}
                <h3 className="text-2xl font-semibold text-primary mb-4">
                    {title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                    {description}
                </p>
            </div>
        </div>
    );
}
