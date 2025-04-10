import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Code, FileText, Filter, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function QuestionBank() {
    const session = await auth();
    if (!session) {
        redirect("/auth/login");
    }

    const userRole = session.user.role;
    const isAuthorized = ["Instructor", "Admin", "Owner"].includes(userRole);

    if (!isAuthorized) {
        redirect("/unauthorized");
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Question Bank</h1>
                    <p className="text-muted-foreground">Manage and organize your exam questions</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Questions</CardTitle>
                        <CardDescription>All question types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">156</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>MCQ Questions</CardTitle>
                        <CardDescription>Multiple choice</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Short Answer</CardTitle>
                        <CardDescription>Text-based answers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Code Questions</CardTitle>
                        <CardDescription>Programming problems</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">33</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Questions</CardTitle>
                            <CardDescription>Manage your question bank</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search questions..." className="pl-8" />
                            </div>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Time Limit</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Used In</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>What is the time complexity of binary search?</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        <FileText className="mr-1 h-3 w-3" />
                                        MCQ
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Easy</Badge>
                                </TableCell>
                                <TableCell>2 min</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>3 exams</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Explain the difference between stack and queue.</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        <BookOpen className="mr-1 h-3 w-3" />
                                        Short Answer
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Medium</Badge>
                                </TableCell>
                                <TableCell>5 min</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>2 exams</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Implement a binary search algorithm.</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        <Code className="mr-1 h-3 w-3" />
                                        Code
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Hard</Badge>
                                </TableCell>
                                <TableCell>10 min</TableCell>
                                <TableCell>10</TableCell>
                                <TableCell>1 exam</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
