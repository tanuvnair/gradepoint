"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Clock, Plus, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type ExamType = "mcq" | "short-answer" | "code-based" | "open-book";

interface Question {
    id: string;
    type: ExamType;
    text: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimit: number;
    points: number;
    options?: string[];
    correctAnswers?: string[];
    codeTemplate?: string;
    testCases?: string[];
}

interface ExamFormData {
    title: string;
    description: string;
    startDate: Date | null;
    startTime: string;
    duration: number;
    allowRetakes: boolean;
    minScore: boolean;
    waitPeriod: boolean;
    timeLimits: {
        easy: number;
        medium: number;
        hard: number;
    };
    questions: Question[];
}

export default function CreateExamForm({ params }: { params: Promise<{ organizationId: string; type: ExamType }> }) {
    const router = useRouter();
    const { organizationId, type } = use(params);
    const [formData, setFormData] = useState<ExamFormData>({
        title: "",
        description: "",
        startDate: null,
        startTime: "",
        duration: 60,
        allowRetakes: false,
        minScore: false,
        waitPeriod: false,
        timeLimits: {
            easy: 2,
            medium: 5,
            hard: 10,
        },
        questions: [],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleTimeLimitChange = (difficulty: keyof ExamFormData["timeLimits"], value: string) => {
        setFormData(prev => ({
            ...prev,
            timeLimits: {
                ...prev.timeLimits,
                [difficulty]: parseInt(value) || 0
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Implement exam creation logic
            console.log("Form submitted:", formData);
            // After successful creation, redirect to exams list
            router.push(`/organization/${organizationId}/exams/all`);
        } catch (error) {
            console.error("Error creating exam:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8 self-start"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Create New {type.charAt(0).toUpperCase() + type.slice(1)} Exam</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Configure your exam settings and questions</p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Exam Details</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Configure basic exam information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm sm:text-base">Exam Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter exam title"
                                className="max-w-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter exam description"
                                className="max-w-2xl"
                            />
                        </div>
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Start Date & Time</Label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.startDate || undefined}
                                                onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        className="w-full sm:w-32"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Duration</Label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="Duration in minutes"
                                        className="max-w-full sm:max-w-[200px]"
                                    />
                                    <Button variant="outline" size="icon" className="w-full sm:w-auto">
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Exam Settings</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Configure exam behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Question Randomization</Label>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" className="w-full">
                                    <Shuffle className="mr-2 h-4 w-4" />
                                    Randomize Questions
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-sm sm:text-base">Adaptive Time Limits</Label>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Label className="w-24 text-sm sm:text-base">Easy:</Label>
                                    <Input
                                        type="number"
                                        className="w-full sm:w-20"
                                        placeholder="min"
                                        value={formData.timeLimits.easy}
                                        onChange={(e) => handleTimeLimitChange("easy", e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Label className="w-24 text-sm sm:text-base">Medium:</Label>
                                    <Input
                                        type="number"
                                        className="w-full sm:w-20"
                                        placeholder="min"
                                        value={formData.timeLimits.medium}
                                        onChange={(e) => handleTimeLimitChange("medium", e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Label className="w-24 text-sm sm:text-base">Hard:</Label>
                                    <Input
                                        type="number"
                                        className="w-full sm:w-20"
                                        placeholder="min"
                                        value={formData.timeLimits.hard}
                                        onChange={(e) => handleTimeLimitChange("hard", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-sm sm:text-base">Retake Policy</Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="allow-retakes"
                                        name="allowRetakes"
                                        checked={formData.allowRetakes}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="allow-retakes" className="text-sm sm:text-base">Allow retakes</Label>
                                </div>
                                <div className="pl-6 space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="min-score"
                                            name="minScore"
                                            checked={formData.minScore}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="min-score" className="text-sm sm:text-base">Minimum score required</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="wait-period"
                                            name="waitPeriod"
                                            checked={formData.waitPeriod}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="wait-period" className="text-sm sm:text-base">Waiting period between retakes</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg sm:text-xl">Questions</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Add and manage exam questions</CardDescription>
                        </div>
                        <Button type="button" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="questions" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="questions">Questions</TabsTrigger>
                            <TabsTrigger value="question-bank">Question Bank</TabsTrigger>
                        </TabsList>
                        <TabsContent value="questions" className="space-y-4">
                            {formData.questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 sm:p-8 text-center">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Plus className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mt-4 text-base font-medium sm:text-lg">No questions added yet</h3>
                                    <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                                        Click the "Add Question" button to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.questions.map((question) => (
                                        <div key={question.id} className="rounded-lg border p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                                                <h3 className="font-medium text-sm sm:text-base">{question.text}</h3>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                    <Button variant="ghost" size="sm">Delete</Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="question-bank">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                    <Input placeholder="Search questions..." className="max-w-full sm:max-w-sm" />
                                    <Button variant="outline" className="w-full sm:w-auto">Filter</Button>
                                </div>
                                {/* Question bank table will go here */}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
                <Button variant="outline" type="button" className="w-full sm:w-auto">Save as Draft</Button>
                <Button type="submit" className="w-full sm:w-auto">Publish Exam</Button>
            </div>
        </form>
    );
}
