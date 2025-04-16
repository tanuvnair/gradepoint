"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

type ExamType = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "OPEN_ENDED" | "CODE_BASED";

interface Question {
    id?: string;
    content: string;
    type: ExamType;
    points: number;
    order: number;
    options?: Record<string, string>;
    correctAnswer?: {
        option: string;
    };
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
        id?: string;
        title: string;
        description?: string;
        order: number;
        questions: Question[];
    }[];
}

export default function EditExamForm({ params }: { params: Promise<{ organizationId: string; examId: string }> }) {
    const router = useRouter();
    const { organizationId, examId } = use(params);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<ExamFormData>({
        title: "",
        description: "",
        timeLimit: 0,
        passingScore: 0,
        randomizeOrder: false,
        publishedAt: null,
        startDate: null,
        endDate: null,
        allowedAttempts: 1,
        sections: [],
    });

    useEffect(() => {
        async function fetchExam() {
            try {
                const response = await fetch(`/api/organization/${organizationId}/exams/${examId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch exam');
                }
                const exam = await response.json();

                setFormData({
                    title: exam.title,
                    description: exam.description || "",
                    timeLimit: exam.timeLimit || 0,
                    passingScore: exam.passingScore || 0,
                    randomizeOrder: exam.randomizeOrder,
                    publishedAt: exam.publishedAt,
                    startDate: exam.startDate,
                    endDate: exam.endDate,
                    allowedAttempts: exam.allowedAttempts || 1,
                    sections: exam.sections.map((section: any) => ({
                        id: section.id,
                        title: section.title,
                        description: section.description || "",
                        order: section.order,
                        questions: section.questions.map((question: any) => ({
                            id: question.id,
                            content: question.content,
                            type: question.type,
                            points: question.points,
                            order: question.order,
                            options: question.options || {},
                            correctAnswer: question.correctAnswer || {}
                        }))
                    }))
                });
            } catch (error) {
                console.error("Error fetching exam:", error);
                toast({
                    title: "Error",
                    description: "Failed to load exam data",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchExam();
    }, [organizationId, examId, toast]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    }, []);

    const handleDateChange = useCallback((name: string, date: Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            [name]: date ? date.toISOString() : null
        }));
    }, []);

    const handleSectionChange = useCallback((index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === index ? { ...section, [field]: value } : section
            )
        }));
    }, []);

    const handleQuestionChange = useCallback((sectionIndex: number, questionIndex: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                    ...section,
                    questions: section.questions.map((question, qIndex) =>
                        qIndex === questionIndex ? { ...question, [field]: value } : question
                    )
                } : section
            )
        }));
    }, []);

    const addSection = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    title: "",
                    description: "",
                    order: prev.sections.length,
                    questions: []
                }
            ]
        }));
    }, []);

    const removeSection = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    }, []);

    const addQuestion = useCallback((sectionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, index) =>
                index === sectionIndex ? {
                    ...section,
                    questions: [
                        ...section.questions,
                        {
                            content: "",
                            type: "MULTIPLE_CHOICE" as ExamType,
                            points: 1,
                            order: section.questions.length,
                            options: {},
                            correctAnswer: { option: "" }
                        }
                    ]
                } : section
            )
        }));
    }, []);

    const removeQuestion = useCallback((sectionIndex: number, questionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, sIndex) =>
                sIndex === sectionIndex ? {
                    ...section,
                    questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex)
                } : section
            )
        }));
    }, []);

    const moveSection = useCallback((index: number, direction: "up" | "down") => {
        setFormData(prev => {
            const newSections = [...prev.sections];
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= newSections.length) {
                return prev;
            }

            [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

            return {
                ...prev,
                sections: newSections.map((section, i) => ({
                    ...section,
                    order: i
                }))
            };
        });
    }, []);

    const validateForm = useCallback(() => {
        if (!formData.title.trim()) {
            toast({
                title: "Error",
                description: "Exam title is required",
                variant: "destructive",
            });
            return false;
        }

        if (formData.sections.length === 0) {
            toast({
                title: "Error",
                description: "At least one section is required",
                variant: "destructive",
            });
            return false;
        }

        for (const section of formData.sections) {
            if (!section.title.trim()) {
                toast({
                    title: "Error",
                    description: "Section title is required",
                    variant: "destructive",
                });
                return false;
            }

            if (section.questions.length === 0) {
                toast({
                    title: "Error",
                    description: "Each section must have at least one question",
                    variant: "destructive",
                });
                return false;
            }

            for (const question of section.questions) {
                if (!question.content.trim()) {
                    toast({
                        title: "Error",
                        description: "Question content is required",
                        variant: "destructive",
                    });
                    return false;
                }

                if (question.type === "MULTIPLE_CHOICE") {
                    if (Object.keys(question.options || {}).length < 2) {
                        toast({
                            title: "Error",
                            description: "Multiple choice questions must have at least 2 options",
                            variant: "destructive",
                        });
                        return false;
                    }

                    if (!question.correctAnswer?.option) {
                        toast({
                            title: "Error",
                            description: "Correct answer must be selected for multiple choice questions",
                            variant: "destructive",
                        });
                        return false;
                    }
                }
            }
        }

        return true;
    }, [formData, toast]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const requestBody = {
                ...formData,
                timeLimit: formData.timeLimit || null,
                passingScore: formData.passingScore || null,
                publishedAt: formData.publishedAt || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                allowedAttempts: formData.allowedAttempts || null,
                sections: formData.sections.map((section, index) => ({
                    ...section,
                    order: index,
                    questions: section.questions.map((question, qIndex) => ({
                        ...question,
                        order: qIndex,
                        points: parseFloat(question.points.toString()),
                        options: question.type === "MULTIPLE_CHOICE" ? question.options || {} : {},
                        correctAnswer: question.type === "MULTIPLE_CHOICE" ? question.correctAnswer || {} : {}
                    }))
                }))
            };

            const response = await fetch(`/api/organization/${organizationId}/exams/${examId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update exam');
            }

            toast({
                title: "Success",
                description: "Exam updated successfully",
            });
            router.push(`/organization/${organizationId}/exams/all`);
        } catch (error) {
            console.error("Error updating exam:", error);
            toast({
                title: "Error",
                description: "Failed to update exam",
                variant: "destructive",
            });
        }
    }, [formData, organizationId, examId, router, toast, validateForm]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
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
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Edit Exam</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Update your exam settings and questions</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Exam Details</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Configure basic exam information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Exam Title</Label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter exam title"
                                required
                                maxLength={20}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Description</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter exam description"
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
                                                onSelect={(date) => handleDateChange('startDate', date)}
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
                                <Switch
                                    id="randomizeOrder"
                                    checked={formData.randomizeOrder}
                                    onCheckedChange={(checked: boolean) => {
                                        handleInputChange({
                                            target: {
                                                name: 'randomizeOrder',
                                                type: 'checkbox',
                                                checked
                                            }
                                        } as React.ChangeEvent<HTMLInputElement>);
                                    }}
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

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-xl">Exam Sections</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Add and manage exam sections</CardDescription>
                            </div>
                            <Button
                                type="button"
                                className="gap-2"
                                onClick={addSection}
                            >
                                <Plus className="h-4 w-4" />
                                Add Section
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {formData.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Section title"
                                                    value={section.title}
                                                    onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => moveSection(sectionIndex, "up")}
                                                    disabled={sectionIndex === 0}
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => moveSection(sectionIndex, "down")}
                                                    disabled={sectionIndex === formData.sections.length - 1}
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => removeSection(sectionIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Section Description</Label>
                                            <Textarea
                                                placeholder="Section description"
                                                value={section.description}
                                                onChange={(e) => handleSectionChange(sectionIndex, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <CardTitle className="text-base sm:text-lg">Questions</CardTitle>
                                                    <CardDescription className="text-xs sm:text-sm">Add and manage questions in this section</CardDescription>
                                                </div>
                                                <Button
                                                    type="button"
                                                    className="gap-2"
                                                    onClick={() => addQuestion(sectionIndex)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Question
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {section.questions.length === 0 ? (
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
                                                        {section.questions.map((question, questionIndex) => (
                                                            <div key={questionIndex} className="rounded-lg border p-4">
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                                                                        <div className="flex-1">
                                                                            <Input
                                                                                placeholder="Enter question content"
                                                                                value={question.content}
                                                                                onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'content', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Select
                                                                                value={question.type}
                                                                                onValueChange={(value) => handleQuestionChange(sectionIndex, questionIndex, "type", value)}
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
                                                                                onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'points', e.target.value)}
                                                                            />
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (questionIndex > 0) {
                                                                                        const newSections = [...formData.sections];
                                                                                        const questions = [...newSections[sectionIndex].questions];
                                                                                        [questions[questionIndex], questions[questionIndex - 1]] = [questions[questionIndex - 1], questions[questionIndex]];
                                                                                        newSections[sectionIndex].questions = questions.map((q, i) => ({
                                                                                            ...q,
                                                                                            order: i
                                                                                        }));
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            sections: newSections
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                                disabled={questionIndex === 0}
                                                                            >
                                                                                <ArrowUp className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (questionIndex < section.questions.length - 1) {
                                                                                        const newSections = [...formData.sections];
                                                                                        const questions = [...newSections[sectionIndex].questions];
                                                                                        [questions[questionIndex], questions[questionIndex + 1]] = [questions[questionIndex + 1], questions[questionIndex]];
                                                                                        newSections[sectionIndex].questions = questions.map((q, i) => ({
                                                                                            ...q,
                                                                                            order: i
                                                                                        }));
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            sections: newSections
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                                disabled={questionIndex === section.questions.length - 1}
                                                                            >
                                                                                <ArrowDown className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                type="button"
                                                                                onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    {question.type === "MULTIPLE_CHOICE" && (
                                                                        <div className="space-y-2">
                                                                            <Label>Options</Label>
                                                                            <div className="space-y-2">
                                                                                {Object.entries(question.options || {}).map(([key, value], optionIndex) => (
                                                                                    <div key={key} className="flex items-center gap-2">
                                                                                        <Input
                                                                                            placeholder={`Option ${optionIndex + 1}`}
                                                                                            value={value}
                                                                                            onChange={(e) => {
                                                                                                const newOptions = { ...question.options };
                                                                                                newOptions[key] = e.target.value;
                                                                                                handleQuestionChange(sectionIndex, questionIndex, "options", newOptions);
                                                                                            }}
                                                                                        />
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`correct-answer-${sectionIndex}-${questionIndex}`}
                                                                                            value={key}
                                                                                            checked={question.correctAnswer?.option === key}
                                                                                            onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, "correctAnswer", { option: e.target.value })}
                                                                                        />
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const newOptions = { ...question.options };
                                                                                                delete newOptions[key];
                                                                                                handleQuestionChange(sectionIndex, questionIndex, "options", newOptions);
                                                                                                if (question.correctAnswer?.option === key) {
                                                                                                    handleQuestionChange(sectionIndex, questionIndex, "correctAnswer", { option: "" });
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newOptions = { ...question.options };
                                                                                        const newKey = `option${Object.keys(question.options || {}).length + 1}`;
                                                                                        newOptions[newKey] = "";
                                                                                        handleQuestionChange(sectionIndex, questionIndex, "options", newOptions);
                                                                                    }}
                                                                                >
                                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                                    Add Option
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                    >
                        Update Exam
                    </Button>
                </div>
            </form>
        </div>
    );
}
