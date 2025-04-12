"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type ExamType = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "OPEN_ENDED" | "CODE_BASED";

interface Question {
    content: string;
    type: ExamType;
    points: number;
    order: number;
    options?: Record<string, unknown>;
    correctAnswer?: Record<string, unknown>;
}

interface ExamFormData {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    randomizeOrder: boolean;
    publishedAt: string | null;
    startDate: string | null;
    endDate: string | null;
    allowedAttempts: number;
    sections: {
        title: string;
        description?: string;
        order: number;
        questions: Question[];
    }[];
}

export default function CreateExamForm({ params }: { params: Promise<{ organizationId: string; type: ExamType }> }) {
    const router = useRouter();
    const { organizationId, type } = use(params);
    const { toast } = useToast();
    const [formData, setFormData] = useState<ExamFormData>({
        title: "",
        description: "",
        timeLimit: 60,
        passingScore: 0,
        randomizeOrder: false,
        publishedAt: null,
        startDate: null,
        endDate: null,
        allowedAttempts: 1,
        sections: [{
            title: "Section 1",
            order: 0,
            questions: []
        }]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/organization/${organizationId}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                toast({
                    variant: "destructive",
                    title: "Failed to create exam",
                    description: error.message || "An error occurred while creating the exam",
                });
                return;
            }

            const data = await response.json();
            router.push(`/organization/${organizationId}/exams/all`);
        } catch (error) {
            console.error('Error creating exam:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while creating the exam",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault();
                        router.back();
                    }}
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
                                <Label className="text-sm sm:text-base">Start Date</Label>
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
                                                {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                                onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date ? date.toISOString() : null }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Time Limit (minutes)</Label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        type="number"
                                        name="timeLimit"
                                        value={formData.timeLimit}
                                        onChange={handleInputChange}
                                        placeholder="Duration in minutes"
                                        className="max-w-full sm:max-w-[200px]"
                                    />
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
                                <input
                                    type="checkbox"
                                    id="randomizeOrder"
                                    name="randomizeOrder"
                                    checked={formData.randomizeOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, randomizeOrder: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="randomizeOrder" className="text-sm sm:text-base">Randomize question order</Label>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-sm sm:text-base">Passing Score</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    type="number"
                                    name="passingScore"
                                    value={formData.passingScore}
                                    onChange={handleInputChange}
                                    placeholder="Minimum passing score"
                                    className="max-w-full sm:max-w-[200px]"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-sm sm:text-base">Allowed Attempts</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    type="number"
                                    name="allowedAttempts"
                                    value={formData.allowedAttempts}
                                    onChange={handleInputChange}
                                    placeholder="Number of attempts allowed"
                                    className="max-w-full sm:max-w-[200px]"
                                />
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
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={() => {
                                const newQuestion: Question = {
                                    content: "",
                                    type: "MULTIPLE_CHOICE",
                                    points: 1,
                                    order: formData.sections[0].questions.length,
                                };
                                setFormData(prev => ({
                                    ...prev,
                                    sections: [{
                                        ...prev.sections[0],
                                        questions: [...prev.sections[0].questions, newQuestion]
                                    }]
                                }));
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {formData.sections[0].questions.length === 0 ? (
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
                                {formData.sections[0].questions.map((question, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="Enter question content"
                                                        value={question.content}
                                                        onChange={(e) => {
                                                            const newQuestions = [...formData.sections[0].questions];
                                                            newQuestions[index] = {
                                                                ...question,
                                                                content: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sections: [{
                                                                    ...prev.sections[0],
                                                                    questions: newQuestions
                                                                }]
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={question.type}
                                                        onValueChange={(value: Question["type"]) => {
                                                            const newQuestions = [...formData.sections[0].questions];
                                                            newQuestions[index] = {
                                                                ...question,
                                                                type: value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sections: [{
                                                                    ...prev.sections[0],
                                                                    questions: newQuestions
                                                                }]
                                                            }));
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                                            <SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
                                                            <SelectItem value="CODE_BASED">Code Based</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        placeholder="Points"
                                                        className="w-20"
                                                        value={question.points}
                                                        onChange={(e) => {
                                                            const newQuestions = [...formData.sections[0].questions];
                                                            newQuestions[index] = {
                                                                ...question,
                                                                points: parseFloat(e.target.value) || 0
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sections: [{
                                                                    ...prev.sections[0],
                                                                    questions: newQuestions
                                                                }]
                                                            }));
                                                        }}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newQuestions = formData.sections[0].questions.filter((_, i) => i !== index);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sections: [{
                                                                    ...prev.sections[0],
                                                                    questions: newQuestions
                                                                }]
                                                            }));
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                            {question.type === "MULTIPLE_CHOICE" && (
                                                <div className="space-y-2">
                                                    <Label>Options</Label>
                                                    <div className="space-y-2">
                                                        {Array.from({ length: 4 }).map((_, optionIndex) => (
                                                            <div key={optionIndex} className="flex items-center gap-2">
                                                                <Input
                                                                    placeholder={`Option ${optionIndex + 1}`}
                                                                    value={question.options?.[`option${optionIndex + 1}`] as string || ""}
                                                                    onChange={(e) => {
                                                                        const newQuestions = [...formData.sections[0].questions];
                                                                        newQuestions[index] = {
                                                                            ...question,
                                                                            options: {
                                                                                ...question.options,
                                                                                [`option${optionIndex + 1}`]: e.target.value
                                                                            }
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            sections: [{
                                                                                ...prev.sections[0],
                                                                                questions: newQuestions
                                                                            }]
                                                                        }));
                                                                    }}
                                                                />
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-answer-${index}`}
                                                                    checked={question.correctAnswer?.value === `option${optionIndex + 1}`}
                                                                    onChange={() => {
                                                                        const newQuestions = [...formData.sections[0].questions];
                                                                        newQuestions[index] = {
                                                                            ...question,
                                                                            correctAnswer: {
                                                                                value: `option${optionIndex + 1}`
                                                                            }
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            sections: [{
                                                                                ...prev.sections[0],
                                                                                questions: newQuestions
                                                                            }]
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
                <Button variant="outline" type="button" className="w-full sm:w-auto">Save as Draft</Button>
                <Button type="submit" className="w-full sm:w-auto">Publish Exam</Button>
            </div>
        </form>
    );
}
