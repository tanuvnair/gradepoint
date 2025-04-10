"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, CheckCircle, Code, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

const examTypes = [
    {
        type: "mcq",
        title: "Multiple Choice",
        description: "Create an exam with multiple choice questions",
        icon: FileText,
        features: [
            "Single or multiple correct answers",
            "Automatic grading",
            "Randomized options"
        ]
    },
    {
        type: "short-answer",
        title: "Short Answer",
        description: "Create an exam with short answer questions",
        icon: BookOpen,
        features: [
            "Text-based answers",
            "Manual grading",
            "Word limit options"
        ]
    },
    {
        type: "code-based",
        title: "Code Based",
        description: "Create an exam with coding questions",
        icon: Code,
        features: [
            "Code editor interface",
            "Multiple languages",
            "Automated testing"
        ]
    },
    {
        type: "open-book",
        title: "Open Book",
        description: "Create an open book exam",
        icon: CheckCircle,
        features: [
            "Extended time limits",
            "Resource allowance",
            "Complex questions"
        ]
    },
];

export default function CreateExamPage({ params }: { params: Promise<{ organizationId: string }> }) {
    const router = useRouter();
    const { organizationId } = use(params);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/organization/${organizationId}/exams/all`)}
                    className="h-8 w-8 self-start"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Create New Exam</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Select the type of exam you want to create</p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {examTypes.map((examType) => {
                    const Icon = examType.icon;
                    return (
                        <Card
                            key={examType.type}
                            className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                            onClick={() => router.push(`/organization/${organizationId}/exams/create/${examType.type}`)}
                        >
                            <CardHeader className="space-y-4 sm:space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">{examType.title}</CardTitle>
                                </div>
                                <CardDescription className="text-sm sm:text-base">{examType.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3 text-sm text-muted-foreground sm:space-y-4 sm:text-base">
                                    {examType.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
