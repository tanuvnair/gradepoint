import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Flag, Navigation, Save } from "lucide-react";
import { redirect } from "next/navigation";

interface Question {
    id: string;
    type: "mcq" | "short-answer" | "code-based" | "open-book";
    text: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimit: number;
    points: number;
    options?: string[];
    codeTemplate?: string;
    testCases?: string[];
}

export default async function TakeExam({ params }: { params: { examId: string } }) {
    const session = await auth();
    if (!session) {
        redirect("/auth/login");
    }

    const userRole = session.user.role;
    if (userRole !== "Student") {
        redirect("/unauthorized");
    }

    return (
        <div className="flex h-screen">
            {/* Question Navigation Sidebar */}
            <div className="w-64 border-r p-4 space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Questions</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="icon"
                                className="relative"
                            >
                                {i + 1}
                                <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Time Remaining</h3>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">01:45:23</span>
                    </div>
                    <Progress value={65} />
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Progress</h3>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Answered</span>
                            <span>8/20</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Flagged</span>
                            <span>3</span>
                        </div>
                    </div>
                </div>
                <Button className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save & Exit
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Midterm Exam</h1>
                        <p className="text-muted-foreground">Computer Science 101</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Navigation className="mr-2 h-4 w-4" />
                            Navigation
                        </Button>
                        <Button variant="outline">
                            <Flag className="mr-2 h-4 w-4" />
                            Flag Question
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Question 1</CardTitle>
                                <CardDescription>Multiple Choice (2 points)</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Time remaining: 2:30</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg">
                            What is the time complexity of a binary search algorithm?
                        </p>

                        <RadioGroup className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="a" id="a" />
                                <Label htmlFor="a">O(n)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="b" id="b" />
                                <Label htmlFor="b">O(log n)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="c" id="c" />
                                <Label htmlFor="c">O(n²)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="d" id="d" />
                                <Label htmlFor="d">O(1)</Label>
                            </div>
                        </RadioGroup>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline">Previous</Button>
                            <Button>Next</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Question 2</CardTitle>
                                <CardDescription>Short Answer (5 points)</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Time remaining: 5:00</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg">
                            Explain the difference between a stack and a queue data structure.
                        </p>

                        <Textarea
                            placeholder="Type your answer here..."
                            className="min-h-[200px]"
                        />

                        <div className="flex justify-between pt-4">
                            <Button variant="outline">Previous</Button>
                            <Button>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
