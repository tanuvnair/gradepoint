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
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

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

const initialFormData: ExamFormData = {
    title: "",
    description: "",
    timeLimit: 60,
    passingScore: 1,
    randomizeOrder: false,
    publishedAt: null,
    startDate: null,
    endDate: null,
    allowedAttempts: 1,
    sections: [{
        title: "Section 1",
        description: "",
        order: 0,
        questions: []
    }]
};

export default function CreateExamForm({ params }: { params: Promise<{ organizationId: string }> }) {
    const router = useRouter();
    const { organizationId } = use(params);
    const { toast } = useToast();
    const [formData, setFormData] = useState<ExamFormData>(() => {
        // Try to load saved form data from localStorage
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('examFormData');
            return savedData ? JSON.parse(savedData) : initialFormData;
        }
        return initialFormData;
    });

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('examFormData', JSON.stringify(formData));
        }
    }, [formData]);

    // Clear saved form data when component unmounts or when exam is successfully created
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('examFormData');
            }
        };
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value
        }));
    }, []);

    const handleNumberInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === "" ? null : parseFloat(value);
        setFormData(prev => ({
            ...prev,
            [name]: name === 'timeLimit' && numValue === 0 ? null : (numValue || 0)
        }));
    }, []);

    const handleDateChange = useCallback((name: string, date: Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            [name]: date ? date.toISOString() : null
        }));
    }, []);

    const handleQuestionChange = useCallback((
        sectionIndex: number,
        questionIndex: number,
        field: keyof Question | 'options' | 'correctAnswer',
        value: any
    ) => {
        setFormData(prev => {
            const newSections = [...prev.sections];
            const question = { ...newSections[sectionIndex].questions[questionIndex] };

            if (field === 'points') {
                question[field] = parseFloat(value) || 0;
            } else if (field === 'type') {
                question.type = value;
                if (value !== 'MULTIPLE_CHOICE') {
                    question.options = {};
                    question.correctAnswer = {};
                } else {
                    question.options = question.options || {};
                    question.correctAnswer = question.correctAnswer || { value: '' };
                }
            } else if (field === 'options' || field === 'correctAnswer') {
                if (field === 'correctAnswer') {
                    question.correctAnswer = { value };
                } else {
                    question[field] = value;
                }
            } else {
                (question as any)[field] = value;
            }

            newSections[sectionIndex].questions[questionIndex] = question;
            return { ...prev, sections: newSections };
        });
    }, []);

    const handleSectionChange = useCallback((sectionIndex: number, field: 'title' | 'description', value: string) => {
        setFormData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                [field]: value
            };
            return { ...prev, sections: newSections };
        });
    }, []);

    const handleOptionChange = useCallback((sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
        setFormData(prev => {
            const newSections = [...prev.sections];
            const question = { ...newSections[sectionIndex].questions[questionIndex] };
            question.options = {
                ...question.options,
                [`option${optionIndex + 1}`]: value
            };
            newSections[sectionIndex].questions[questionIndex] = question;
            return { ...prev, sections: newSections };
        });
    }, []);

    const validateForm = useCallback(() => {
        if (!formData.title.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Exam title is required",
            });
            return false;
        }

        if (formData.title.length > 20) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Exam title must be 20 characters or less",
            });
            return false;
        }

        if (formData.timeLimit < 1) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Time limit must be at least 1 minute",
            });
            return false;
        }

        // Calculate total possible score
        const totalScore = formData.sections.reduce((total, section) => {
            return total + section.questions.reduce((sectionTotal, question) => {
                return sectionTotal + (question.points || 0);
            }, 0);
        }, 0);

        if (formData.passingScore <= 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Passing score must be greater than 0",
            });
            return false;
        }

        if (formData.passingScore > totalScore) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: `Passing score cannot be greater than the total possible score (${totalScore})`,
            });
            return false;
        }

        if (formData.allowedAttempts <= 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Allowed attempts must be greater than 0",
            });
            return false;
        }

        if (formData.sections.length === 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "At least one section is required",
            });
            return false;
        }

        for (const [sectionIndex, section] of formData.sections.entries()) {
            if (!section.title.trim()) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: `Section ${sectionIndex + 1} title is required`,
                });
                return false;
            }

            if (section.questions.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: `Section "${section.title}" must have at least one question`,
                });
                return false;
            }

            for (const [questionIndex, question] of section.questions.entries()) {
                if (!question.content.trim()) {
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: `Question ${questionIndex + 1} in section "${section.title}" is required`,
                    });
                    return false;
                }

                if (question.points <= 0) {
                    toast({
                        variant: "destructive",
                        title: "Validation Error",
                        description: `Question ${questionIndex + 1} in section "${section.title}" must have points greater than 0`,
                    });
                    return false;
                }

                if (question.type === "MULTIPLE_CHOICE") {
                    const hasOptions = Object.values(question.options || {}).some(option => option?.toString().trim());
                    if (!hasOptions) {
                        toast({
                            variant: "destructive",
                            title: "Validation Error",
                            description: `Question ${questionIndex + 1} in section "${section.title}" must have at least one option`,
                        });
                        return false;
                    }

                    if (!question.correctAnswer?.value) {
                        toast({
                            variant: "destructive",
                            title: "Validation Error",
                            description: `Question ${questionIndex + 1} in section "${section.title}" must have a correct answer selected`,
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
                timeLimit: formData.timeLimit === 0 ? null : formData.timeLimit,
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

            const response = await fetch(`/api/organization/${organizationId}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create exam');
            }

            toast({
                title: "Success",
                description: "Exam created successfully",
            });
            router.push(`/organization/${organizationId}/exams/all`);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    }, [formData, organizationId, router, toast, validateForm]);

    const handleSaveAsDraft = useCallback(async () => {
        try {
            if (!formData.title.trim()) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "Exam title is required",
                });
                return;
            }

            const response = await fetch(`/api/organization/${organizationId}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    publishedAt: null,
                    sections: formData.sections.map((section, index) => ({
                        ...section,
                        order: index,
                        questions: section.questions.map((question, qIndex) => ({
                            ...question,
                            order: qIndex,
                            points: parseFloat(question.points.toString()),
                            options: question.options || {},
                            correctAnswer: question.correctAnswer || {}
                        }))
                    }))
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save exam as draft');
            }

            toast({
                title: "Success",
                description: "Exam saved as draft",
            });
            router.push(`/organization/${organizationId}/exams/all`);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred while saving the draft",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    }, [formData, organizationId, router, toast]);

    const memoizedForm = useMemo(() => (
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
                            <p className="text-xs text-muted-foreground">Leave empty to start immediately</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">End Date</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.endDate ? format(new Date(formData.endDate), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                            onSelect={(date) => handleDateChange('endDate', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty to run indefinitely</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Time Limit (minutes)</Label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input
                                type="number"
                                name="timeLimit"
                                value={formData.timeLimit === null ? "" : formData.timeLimit}
                                onChange={handleNumberInputChange}
                                placeholder="Duration in minutes"
                                className="max-w-full sm:max-w-[200px]"
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Leave empty for no time limit</p>
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
                                onChange={handleNumberInputChange}
                                placeholder="Minimum passing score"
                                className="max-w-full sm:max-w-[200px]"
                                min="1"
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
                                onChange={handleNumberInputChange}
                                placeholder="Number of attempts allowed"
                                className="max-w-full sm:max-w-[200px]"
                                min="1"
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
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    sections: [
                                        ...prev.sections,
                                        {
                                            title: `Section ${prev.sections.length + 1}`,
                                            description: "",
                                            order: prev.sections.length,
                                            questions: []
                                        }
                                    ]
                                }));
                            }}
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (sectionIndex > 0) {
                                                        const newSections = [...formData.sections];
                                                        [newSections[sectionIndex], newSections[sectionIndex - 1]] = [newSections[sectionIndex - 1], newSections[sectionIndex]];
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            sections: newSections.map((s, i) => ({
                                                                ...s,
                                                                order: i
                                                            }))
                                                        }));
                                                    }
                                                }}
                                                disabled={sectionIndex === 0}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (sectionIndex < formData.sections.length - 1) {
                                                        const newSections = [...formData.sections];
                                                        [newSections[sectionIndex], newSections[sectionIndex + 1]] = [newSections[sectionIndex + 1], newSections[sectionIndex]];
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            sections: newSections.map((s, i) => ({
                                                                ...s,
                                                                order: i
                                                            }))
                                                        }));
                                                    }
                                                }}
                                                disabled={sectionIndex === formData.sections.length - 1}
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const newSections = formData.sections.filter((_, i) => i !== sectionIndex);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        sections: newSections.map((s, i) => ({
                                                            ...s,
                                                            order: i
                                                        }))
                                                    }));
                                                }}
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
                                                onClick={() => {
                                                    const newSections = [...formData.sections];
                                                    newSections[sectionIndex] = {
                                                        ...section,
                                                        questions: [
                                                            ...section.questions,
                                                            {
                                                                content: "",
                                                                type: "MULTIPLE_CHOICE",
                                                                points: 1,
                                                                order: section.questions.length,
                                                                options: {},
                                                                correctAnswer: {}
                                                            }
                                                        ]
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        sections: newSections
                                                    }));
                                                }}
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
                                                                            onValueChange={(value: Question["type"]) => {
                                                                                handleQuestionChange(sectionIndex, questionIndex, 'type', value);
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
                                                                            onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'points', e.target.value)}
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
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
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
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
                                                                            onClick={() => {
                                                                                const newSections = [...formData.sections];
                                                                                newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    sections: newSections
                                                                                }));
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
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
                                                                                        onChange={(e) => handleOptionChange(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                                                                    />
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`correct-answer-${sectionIndex}-${questionIndex}`}
                                                                                        value={`option${optionIndex + 1}`}
                                                                                        checked={question.correctAnswer?.value === `option${optionIndex + 1}`}
                                                                                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'correctAnswer', e.target.value)}
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
                    onClick={handleSaveAsDraft}
                >
                    Save as Draft
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                        e.preventDefault();
                        setFormData(prev => ({
                            ...prev,
                            publishedAt: new Date().toISOString()
                        }));
                        handleSubmit(e);
                    }}
                >
                    Publish Exam
                </Button>
            </div>
        </form>
    ), [handleSubmit, handleSaveAsDraft]);

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
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Create New Exam</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Configure your exam settings and questions</p>
                </div>
            </div>
            {memoizedForm}
        </div>
    );
}
