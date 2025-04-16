"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, FileText, Loader2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExamResponse } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "OWNER";
    totalExams?: number;
    totalAttempts: number;
    averageMarks: number;
    totalMarksAvailable: number;
    passingMarks: number;
    recentAttempts: Array<{
        id: string;
        score: number | null;
        submittedAt: string | null;
        responses: Array<{
            id: string;
            response: string | null;
            isCorrect: boolean | null;
            score: number | null;
            feedback: string | null;
            question: {
                id: string;
                content: string;
                type: string;
                points: number;
                options?: Record<string, string>;
                correctAnswer?: string;
            };
        }>;
        exam: {
            title: string;
            description: string | null;
            passingScore: number | null;
            totalMarks: number;
            creator?: {
                name: string | null;
                email: string;
            };
        };
        user?: {
            name: string | null;
            email: string;
        };
    }>;
    upcomingExams: Array<{
        id: string;
        title: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        timeLimit: number | null;
        creator?: {
            name: string | null;
            email: string;
        };
    }>;
}

// Add skeleton component
const AnswerSkeleton = () => (
    <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
);

export default function Dashboard() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const [isResending, setIsResending] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState<DashboardStats["recentAttempts"][0] | null>(null);
    const [isLoadingResponses, setIsLoadingResponses] = useState(false);
    const pathname = usePathname();
    const organizationId = pathname.split("/")[2];

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch(`/api/organization/${organizationId}/dashboard`);
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard stats");
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load dashboard statistics",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, [organizationId, toast]);

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

    const handleAttemptClick = (attempt: DashboardStats["recentAttempts"][0]) => {
        console.log("Selected attempt:", attempt);
        console.log("Responses:", attempt.responses);
        setSelectedAttempt(attempt);
        setIsLoadingResponses(true);
        // Simulate loading delay to show skeleton
        setTimeout(() => {
            setIsLoadingResponses(false);
        }, 500);
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
            {!session?.user?.emailVerified && (
                <div className="w-full p-4 bg-primary/10 border border-primary/20 text-primary rounded-md">
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
            <div className="flex flex-col gap-2 sm:gap-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Dashboard</h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    {stats?.role === "STUDENT" ? "View your exam performance" :
                     stats?.role === "INSTRUCTOR" ? "Monitor your created exams" :
                     "View organization-wide exam statistics"}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageMarks.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">out of {stats?.totalMarksAvailable.toFixed(1)}</p>
                        <Progress 
                            value={(stats?.averageMarks || 0) / (stats?.totalMarksAvailable || 1) * 100} 
                            className="mt-2" 
                        />
                    </CardContent>
                </Card>
                {stats?.role !== "STUDENT" && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalExams}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.role === "INSTRUCTOR" ? "Created" : "In Organization"}
                            </p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAttempts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.role === "STUDENT" ? "Your Attempts" :
                             stats?.role === "INSTRUCTOR" ? "On Your Exams" :
                             "Organization-wide"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Passing Marks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.passingMarks.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Required to pass</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Attempts</CardTitle>
                    <CardDescription>
                        {stats?.role === "STUDENT" ? "Your latest exam results" :
                         stats?.role === "INSTRUCTOR" ? "Recent attempts on your exams" :
                         "Recent exam attempts across the organization"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {stats?.recentAttempts.map((attempt) => (
                        <Card 
                            key={attempt.id} 
                            className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                            onClick={() => handleAttemptClick(attempt)}
                        >
                            <CardHeader className="space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2.5">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-base">{attempt.exam.title}</CardTitle>
                                    </div>
                                    <Badge variant={attempt.score && attempt.exam.passingScore && attempt.score >= attempt.exam.passingScore ? "default" : "destructive"}>
                                        {attempt.score?.toFixed(1)} / {attempt.exam.totalMarks.toFixed(1)}
                                    </Badge>
                                </div>
                                <CardDescription>{attempt.exam.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {stats.role !== "STUDENT" && attempt.user && (
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs">{attempt.user.name || attempt.user.email}</span>
                                        </div>
                                    )}
                                    {stats.role === "ADMIN" || stats.role === "OWNER" ? (
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs">Created by: {attempt.exam.creator?.name || attempt.exam.creator?.email}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs">
                                            {attempt.submittedAt ? format(new Date(attempt.submittedAt), "MMM d, yyyy") : "Not submitted"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Calendar</CardTitle>
                    <CardDescription>View upcoming exams</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-fit">
                            <Calendar
                                mode="single"
                                className="rounded-md border"
                                selected={new Date()}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                }}
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-sm font-medium">Upcoming Exams</h3>
                            <div className="space-y-2">
                                {stats?.upcomingExams.map((exam) => (
                                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{exam.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exam.startDate ? format(new Date(exam.startDate), "MMM d, yyyy") : "No start date"}
                                                    {exam.timeLimit && ` • ${exam.timeLimit} minutes`}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/organization/${organizationId}/exams/all`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedAttempt?.exam.title} - {selectedAttempt?.user?.name || selectedAttempt?.user?.email || "Unknown User"}
                        </DialogTitle>
                    </DialogHeader>
                    {isLoadingResponses ? (
                        <AnswerSkeleton />
                    ) : (
                        <div className="space-y-6">
                            {selectedAttempt?.responses.map((response) => (
                                <div key={response.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{response.question.content}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Points: {response.question.points}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded ${
                                            response.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {response.isCorrect ? response.question.points : 0} / {response.question.points}
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div>
                                            <p className="text-sm font-medium">Your Answer:</p>
                                            <p className="text-sm">
                                                {response.question.type === "MULTIPLE_CHOICE" && response.question.options && response.response
                                                    ? response.question.options[response.response] || response.response
                                                    : response.response || "No answer provided"}
                                            </p>
                                        </div>
                                        {response.question.type === "MULTIPLE_CHOICE" && !response.isCorrect && (
                                            <div>
                                                <p className="text-sm font-medium">Correct Answer:</p>
                                                <p className="text-sm">
                                                    {response.question.options
                                                        ? Object.entries(response.question.options).find(([_, value]) => value === response.question.correctAnswer)?.[1]
                                                        : response.question.correctAnswer}
                                                </p>
                                            </div>
                                        )}
                                        {response.feedback && (
                                            <div>
                                                <p className="text-sm font-medium">Feedback:</p>
                                                <p className="text-sm">{response.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
