"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

// Mock data for demonstration
const mockExams = [
    {
        id: "1",
        title: "Midterm Exam",
        description: "Computer Science 101 - Spring 2024",
        status: "Active",
        duration: 120,
        participants: 45,
        date: "Mar 15, 2024"
    },
    {
        id: "2",
        title: "Final Exam",
        description: "Computer Science 101 - Spring 2024",
        status: "Draft",
        duration: 180,
        participants: 0,
        date: "May 10, 2024"
    }
];

export default function AllExamsPage({ params }: { params: Promise<{ organizationId: string }> }) {
    const router = useRouter();
    const { organizationId } = use(params);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-2 sm:gap-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Exams</h1>
                <p className="text-sm text-muted-foreground sm:text-base">Manage and create exams for your organization</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs defaultValue="all" className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="all" className="text-xs sm:text-sm">All Exams</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                        <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button
                    onClick={() => router.push(`/organization/${organizationId}/exams/create`)}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                </Button>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockExams.map((exam) => (
                    <Card key={exam.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                        <CardHeader className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2.5 sm:p-3">
                                        <FileText className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                                    </div>
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">{exam.title}</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-xs sm:text-sm">
                                    {exam.status}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs sm:text-sm lg:text-base">{exam.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">{exam.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">{exam.participants} participants</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">{exam.date}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
