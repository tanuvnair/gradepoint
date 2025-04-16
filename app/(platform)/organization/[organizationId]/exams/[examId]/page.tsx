"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    Save,
    Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { use } from "react";

interface Question {
    id: string;
    content: string;
    type: string;
    points: number;
    order: number;
    options: Record<string, string>;
}

interface Section {
    id: string;
    title: string;
    description: string | null;
    order: number;
    questions: Question[];
}

interface ExamData {
    title: string;
    timeLimit: number | null;
    sections: Section[];
}

interface AttemptData {
    attemptId: string;
    exam: ExamData;
}

export default function ExamAttemptPage({
    params,
}: {
    params: Promise<{ organizationId: string; examId: string }>;
}) {
    const router = useRouter();
    const { organizationId, examId } = use(params);

    const [loading, setLoading] = useState(true);
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
        "saved"
    );
    const [autoSaveInterval, setAutoSaveInterval] =
        useState<NodeJS.Timeout | null>(null);

    // Check for existing attempts and initialize
    useEffect(() => {
        async function checkExistingAttempts() {
            try {
                setLoading(true);

                // First, check if there are any existing unsubmitted attempts
                const existingAttemptsResponse = await fetch(
                    `/api/organization/${organizationId}/exams/${examId}/attempts/active`,
                    {
                        method: "GET",
                    }
                );

                if (existingAttemptsResponse.ok) {
                    const existingAttemptsData = await existingAttemptsResponse.json();

                    // If there's an active attempt, load it
                    if (existingAttemptsData.attempt) {
                        const attemptId = existingAttemptsData.attempt.id;

                        // Fetch the full attempt data
                        const attemptResponse = await fetch(
                            `/api/organization/${organizationId}/exams/${examId}/attempt/${attemptId}`,
                            {
                                method: "GET",
                            }
                        );

                        if (attemptResponse.ok) {
                            const data = await attemptResponse.json();
                            
                            // Check if the attempt is already submitted
                            if (data.attempt.submittedAt) {
                                toast.error("This exam has already been submitted");
                                router.push(`/organization/${organizationId}/exams/history`);
                                return;
                            }

                            setExamData(data.exam);
                            setAttemptId(data.attempt.id);

                            // Calculate remaining time
                            if (data.exam.timeLimit) {
                                const startedAt = new Date(data.attempt.startedAt);
                                const elapsedSeconds = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000);
                                const totalSeconds = data.exam.timeLimit * 60;
                                const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

                                setTimeRemaining(remainingSeconds);
                            }

                            // Load saved responses
                            const savedResponses: Record<string, any> = {};
                            data.exam.sections.forEach((section) => {
                                section.questions.forEach((question) => {
                                    savedResponses[question.id] = null;
                                });
                            });

                            // Populate with any existing responses
                            if (data.attempt.responses && data.attempt.responses.length > 0) {
                                data.attempt.responses.forEach((response) => {
                                    savedResponses[response.questionId] = response.response;
                                });
                            }

                            setResponses(savedResponses);
                            toast.info("Resuming your previous attempt");
                            setLoading(false);
                            return; // Exit early since we've loaded an existing attempt
                        }
                    }
                }

                // If no active attempt was found or loading it failed, create a new one
                const response = await fetch(
                    `/api/organization/${organizationId}/exams/${examId}/attempt`,
                    {
                        method: "POST",
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(
                        error.error || "Failed to start exam attempt"
                    );
                }

                const data: AttemptData = await response.json();
                setExamData(data.exam);
                setAttemptId(data.attemptId);

                // Initialize time remaining if there's a time limit
                if (data.exam.timeLimit) {
                    setTimeRemaining(data.exam.timeLimit * 60); // Convert minutes to seconds
                }

                // Initialize empty responses for all questions
                const initialResponses: Record<string, any> = {};
                data.exam.sections.forEach((section) => {
                    section.questions.forEach((question) => {
                        initialResponses[question.id] = null;
                    });
                });
                setResponses(initialResponses);
            } catch (error: any) {
                console.error("Error starting exam attempt:", error);
                toast.error(error.message || "Failed to start exam attempt");
                router.push(`/organization/${organizationId}/exams/all`);
            } finally {
                setLoading(false);
            }
        }

        checkExistingAttempts();
    }, [organizationId, examId, router]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Auto-save responses every 30 seconds
    useEffect(() => {
        if (!attemptId) return;

        const interval = setInterval(async () => {
            await saveResponses();
        }, 30000); // 30 seconds

        setAutoSaveInterval(interval);

        return () => {
            if (autoSaveInterval) clearInterval(autoSaveInterval);
        };
    }, [attemptId, responses]);

    // Format time remaining
    const formatTimeRemaining = () => {
        if (timeRemaining === null) return "No time limit";

        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
    };

    // Handle response changes
    const handleResponseChange = (questionId: string, value: any) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: value,
        }));
        setSaveStatus("saving");
    };

    // Save responses to the server
    const saveResponses = async () => {
        if (!attemptId) {
            throw new Error("No active exam attempt found");
        }

        try {
            setSaveStatus("saving");

            // Format responses for API
            const responsesToSave = Object.entries(responses)
                .map(([questionId, response]) => ({
                    questionId,
                    response: response !== null ? response : "",
                }))
                .filter((r) => r.response !== null);

            // Validate that we have at least some responses
            if (responsesToSave.length === 0) {
                setSaveStatus("saved");
                return;
            }

            const response = await fetch(
                `/api/organization/${organizationId}/exams/${examId}/attempt/${attemptId}/responses`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ responses: responsesToSave }),
                }
            );

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error("Server error occurred. Please try again.");
            }

            if (!response.ok) {
                throw new Error(errorData.error || "Failed to save responses");
            }

            if (!errorData.success) {
                throw new Error("Failed to save responses");
            }

            setSaveStatus("saved");
        } catch (error: any) {
            setSaveStatus("error");
            throw error; // Re-throw to be handled by the caller
        }
    };

    // Navigate to previous section
    const goToPreviousSection = async () => {
        if (currentSectionIndex > 0) {
            try {
                await saveResponses();
                setCurrentSectionIndex(currentSectionIndex - 1);
            } catch (error: any) {
                toast.error("Failed to save responses. Please try again.");
            }
        }
    };

    // Navigate to next section
    const goToNextSection = async () => {
        if (examData && currentSectionIndex < examData.sections.length - 1) {
            try {
                await saveResponses();
                setCurrentSectionIndex(currentSectionIndex + 1);
            } catch (error: any) {
                toast.error("Failed to save responses. Please try again.");
            }
        }
    };

    // Submit the exam
    const handleSubmitExam = async () => {
        if (!attemptId) {
            toast.error("No active exam attempt found. Please refresh the page and try again.");
            return;
        }

        if (isSubmitting) {
            return; // Prevent multiple submissions
        }

        try {
            setIsSubmitting(true);
            setSubmitting(true);

            // First save all responses
            try {
                await saveResponses();
            } catch (error: any) {
                toast.error(error.message || "Failed to save your responses. Please try again.");
                setIsSubmitting(false);
                setSubmitting(false);
                setSubmitDialogOpen(false);
                return;
            }

            // Then submit the exam
            const response = await fetch(
                `/api/organization/${organizationId}/exams/${examId}/attempt/${attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error("Server error occurred. Please try again.");
            }

            if (!response.ok) {
                if (errorData.error === "This exam has already been submitted") {
                    toast.error("This exam has already been submitted");
                    router.push(`/organization/${organizationId}/exams/history`);
                    return;
                }
                throw new Error(errorData.error || "Failed to submit exam");
            }

            if (!errorData.success) {
                throw new Error("Submission was not successful");
            }

            toast.success("Exam submitted successfully!");
            // Redirect to results or history page
            router.push(`/organization/${organizationId}/exams/history`);
        } catch (error: any) {
            toast.error(error.message || "Failed to submit your exam. Please try again.");
            setIsSubmitting(false);
            setSubmitting(false);
            setSubmitDialogOpen(false);
        }
    };

    // Auto-save responses
    useEffect(() => {
        if (!attemptId) return;

        let timeoutId: NodeJS.Timeout | undefined;
        const autoSave = async () => {
            try {
                await saveResponses();
                if (saveStatus === "error") {
                    toast.success("Responses saved successfully");
                }
            } catch (error: any) {
                // Only show error toast if it's not already showing
                if (saveStatus !== "error") {
                    toast.error(error.message || "Failed to save your responses automatically");
                }
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus === "saving") {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Auto-save every 30 seconds
        const interval = setInterval(() => {
            if (saveStatus !== "saving") {
                autoSave();
            }
        }, 30000);

        return () => {
            clearInterval(interval);
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [attemptId, responses, saveStatus]);

    // Calculate progress
    const calculateProgress = () => {
        if (!examData) return 0;

        const totalQuestions = examData.sections.reduce(
            (total, section) => total + section.questions.length,
            0
        );

        const answeredQuestions = Object.values(responses).filter(
            (response) => response !== null && response !== ""
        ).length;

        return Math.round((answeredQuestions / totalQuestions) * 100);
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-lg font-medium">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!examData || !attemptId) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-xl">Error</CardTitle>
                        <CardDescription>
                            Failed to load exam data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We couldn't load the exam. Please try again or
                            contact support.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() =>
                                router.push(
                                    `/organization/${organizationId}/exams/all`
                                )
                            }
                        >
                            Back to Exams
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentSection = examData.sections[currentSectionIndex];

    return (
        <div className="container mx-auto flex flex-col gap-6 p-4 md:p-6">
            {/* Exam Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                        {examData.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {currentSection.title} ({currentSectionIndex + 1}/
                        {examData.sections.length})
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {formatTimeRemaining()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">
                            {calculateProgress()}% complete
                        </span>
                        <Progress
                            value={calculateProgress()}
                            className="w-24"
                        />
                    </div>
                </div>
            </div>

            {/* Save Status */}
            <div className="flex items-center justify-end gap-2">
                {saveStatus === "saving" && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Saving...</span>
                    </div>
                )}
                {saveStatus === "saved" && (
                    <div className="flex items-center gap-1.5 text-sm text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Saved</span>
                    </div>
                )}
                {saveStatus === "error" && (
                    <div className="flex items-center gap-1.5 text-sm text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Error saving</span>
                    </div>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={saveResponses}
                    disabled={saveStatus === "saving"}
                >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save
                </Button>
            </div>

            {/* Section Content */}
            <Card>
                <CardHeader>
                    <CardTitle>{currentSection.title}</CardTitle>
                    {currentSection.description && (
                        <CardDescription>
                            {currentSection.description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-8">
                    {currentSection.questions.map((question, index) => (
                        <div key={question.id} className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-base font-medium sm:text-lg">
                                    {index + 1}. {question.content}
                                </h3>
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                    {question.points}{" "}
                                    {question.points === 1 ? "point" : "points"}
                                </span>
                            </div>

                            {question.type === "MULTIPLE_CHOICE" && (
                                <RadioGroup
                                    value={responses[question.id] || ""}
                                    onValueChange={(value) =>
                                        handleResponseChange(question.id, value)
                                    }
                                    className="space-y-3"
                                >
                                    {Object.entries(question.options).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center space-x-2"
                                            >
                                                <RadioGroupItem
                                                    value={key}
                                                    id={`${question.id}-${key}`}
                                                />
                                                <Label
                                                    htmlFor={`${question.id}-${key}`}
                                                >
                                                    {value}
                                                </Label>
                                            </div>
                                        )
                                    )}
                                </RadioGroup>
                            )}

                            {question.type === "SHORT_ANSWER" && (
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Enter your answer here..."
                                        value={responses[question.id] || ""}
                                        onChange={(e) =>
                                            handleResponseChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        className="min-h-[100px]"
                                    />
                                </div>
                            )}

                            {question.type === "OPEN_ENDED" && (
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Enter your answer here..."
                                        value={responses[question.id] || ""}
                                        onChange={(e) =>
                                            handleResponseChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        className="min-h-[200px]"
                                    />
                                </div>
                            )}

                            {question.type === "CODE_BASED" && (
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Write your code here..."
                                        value={responses[question.id] || ""}
                                        onChange={(e) =>
                                            handleResponseChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={goToPreviousSection}
                        disabled={currentSectionIndex === 0}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    {currentSectionIndex < examData.sections.length - 1 ? (
                        <Button onClick={goToNextSection}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => setSubmitDialogOpen(true)}>
                            Submit Exam
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Submit Confirmation Dialog */}
            <AlertDialog
                open={submitDialogOpen}
                onOpenChange={setSubmitDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to submit your exam? You won't
                            be able to make any changes after submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmitExam}
                            disabled={submitting}
                            className={
                                submitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }
                        >
                            {submitting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
