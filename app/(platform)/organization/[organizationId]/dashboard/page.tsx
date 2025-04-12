"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, FileText, Users } from "lucide-react";

export default function Dashboard() {
    // Mock data - replace with actual data from your database
    const upcomingExams = [
        { id: "1", title: "Math Final", description: "Mathematics 101 - Spring 2024", date: new Date(), timeLimit: 120, participants: 45 },
        { id: "2", title: "Science Quiz", description: "Physics 101 - Spring 2024", date: new Date(), timeLimit: 30, participants: 30 },
    ];

    const recentAttempts = [
        { id: "1", examTitle: "History Midterm", description: "History 101 - Spring 2024", score: 85, total: 100, date: new Date() },
        { id: "2", examTitle: "English Test", description: "English 101 - Spring 2024", score: 92, total: 100, date: new Date() },
    ];

    const performanceStats = {
        averageScore: 88,
        totalExams: 5,
        passingRate: 90,
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-2 sm:gap-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Dashboard</h1>
                <p className="text-sm text-muted-foreground sm:text-base">View your exam performance and upcoming exams</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceStats.averageScore}%</div>
                        <Progress value={performanceStats.averageScore} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceStats.totalExams}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceStats.passingRate}%</div>
                        <Progress value={performanceStats.passingRate} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingExams.length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Exams</CardTitle>
                        <CardDescription>Your scheduled exams</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingExams.map((exam) => (
                            <Card key={exam.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                                <CardHeader className="space-y-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2.5">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <CardTitle className="text-base">{exam.title}</CardTitle>
                                        </div>
                                        <Badge variant="outline">Upcoming</Badge>
                                    </div>
                                    <CardDescription>{exam.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs">{exam.timeLimit} min</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs">{exam.participants} participants</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs">{format(exam.date, "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Attempts</CardTitle>
                        <CardDescription>Your latest exam results</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentAttempts.map((attempt) => (
                            <Card key={attempt.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                                <CardHeader className="space-y-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2.5">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <CardTitle className="text-base">{attempt.examTitle}</CardTitle>
                                        </div>
                                        <Badge variant={attempt.score >= 70 ? "default" : "destructive"}>
                                            {attempt.score}/{attempt.total}
                                        </Badge>
                                    </div>
                                    <CardDescription>{attempt.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs">{format(attempt.date, "MMM d, yyyy")}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Calendar</CardTitle>
                    <CardDescription>View your exam schedule</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
