import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TakeExam() {
    const session = await auth();
    if (!session) {
        redirect("/auth/login");
    }

    const userRole = session.user.role;
    if (userRole !== "Student") {
        redirect("/unauthorized");
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Available Exams</h1>
                    <p className="text-muted-foreground">Your upcoming and available examinations</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Midterm Exam</CardTitle>
                                <CardDescription>Computer Science 101</CardDescription>
                            </div>
                            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                Upcoming
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>120 minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>50 questions</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Schedule:</div>
                                <div className="text-sm text-muted-foreground">
                                    April 15, 2024 - 10:00 AM
                                </div>
                            </div>
                            <Button className="w-full" variant="secondary">View Details</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Practice Quiz</CardTitle>
                                <CardDescription>Data Structures</CardDescription>
                            </div>
                            <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                Available
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>30 minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>20 questions</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Available until:</div>
                                <div className="text-sm text-muted-foreground">
                                    April 20, 2024 - 11:59 PM
                                </div>
                            </div>
                            <Button className="w-full">Start Exam</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
