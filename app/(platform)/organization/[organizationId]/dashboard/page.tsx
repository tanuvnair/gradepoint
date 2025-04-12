import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function Dashboard() {
    // Mock data - replace with actual data from your database
    const upcomingExams = [
        { id: "1", title: "Math Final", date: new Date(), timeLimit: 120 },
        { id: "2", title: "Science Quiz", date: new Date(), timeLimit: 30 },
    ];

    const recentAttempts = [
        { id: "1", examTitle: "History Midterm", score: 85, total: 100, date: new Date() },
        { id: "2", examTitle: "English Test", score: 92, total: 100, date: new Date() },
    ];

    const performanceStats = {
        averageScore: 88,
        totalExams: 5,
        passingRate: 90,
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingExams.map((exam) => (
                                <div key={exam.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{exam.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(exam.date, "MMM d, yyyy")} • {exam.timeLimit} min
                                        </p>
                                    </div>
                                    <Button variant="outline">Start Exam</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Attempts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAttempts.map((attempt) => (
                                <div key={attempt.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{attempt.examTitle}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(attempt.date, "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <Badge variant={attempt.score >= 70 ? "default" : "destructive"}>
                                        {attempt.score}/{attempt.total}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Calendar</CardTitle>
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
