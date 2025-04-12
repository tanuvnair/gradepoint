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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText, ListChecks, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExamListSkeleton } from "./skeleton";

interface Exam {
    id: string;
    title: string;
    description: string | null;
    timeLimit: number | null;
    passingScore: number | null;
    randomizeOrder: boolean;
    publishedAt: string | null;
    startDate: string | null;
    endDate: string | null;
    allowedAttempts: number | null;
    creatorId: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    sections: {
        id: string;
        title: string;
        description: string | null;
        order: number;
        examId: string;
        createdAt: string;
        updatedAt: string;
        questions: {
            id: string;
            content: string;
            type: string;
            points: number;
            order: number;
            options: Record<string, string>;
            correctAnswer: {
                option: string;
            };
            sectionId: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }[];
    creator: {
        id: string;
        name: string;
        email: string;
    };
}

interface UserOrganizationDataResponse {
    userOrganizationInfo: {
        id: string;
        userId: string;
        organizationId: string;
        role: string;
    }[];
}

interface ApiResponse {
    data: Exam[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function AllExamsPage({ params }: { params: Promise<{ organizationId: string }> }) {
    const router = useRouter();
    const { organizationId } = use(params);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchUserRole() {
            try {
                const userRes = await fetch(`/api/userOrganization/${organizationId}`);
                const userData = await userRes.json();

                if (userData?.userOrganizationInfo?.length) {
                    setUserRole(userData.userOrganizationInfo[0].role);
                    setUserId(userData.userOrganizationInfo[0].userId);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        }

        fetchUserRole();
    }, [organizationId]);

    useEffect(() => {
        async function fetchExams() {
            try {
                const response = await fetch(`/api/organization/${organizationId}/exams`);
                if (!response.ok) {
                    throw new Error('Failed to fetch exams');
                }
                const data: ApiResponse = await response.json();
                setAllExams(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Error fetching exams:", error);
                setAllExams([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchExams();
    }, [organizationId]);

    const filteredExams = useMemo(() => {
        let exams = allExams;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            exams = exams.filter(exam =>
                exam.title.toLowerCase().includes(query) ||
                (exam.description?.toLowerCase().includes(query) ?? false)
            );
        }

        // Filter by tab
        switch (activeTab) {
            case "all":
                // Show all published exams for students
                if (userRole === "STUDENT") {
                    exams = exams.filter(exam => exam.publishedAt !== null);
                }
                break;
            case "ongoing":
                // Show exams that are currently active (published and within start/end date)
                const now = new Date();
                exams = exams.filter(exam => {
                    if (!exam.publishedAt) return false;
                    const startDate = exam.startDate ? new Date(exam.startDate) : null;
                    const endDate = exam.endDate ? new Date(exam.endDate) : null;
                    return (!startDate || startDate <= now) && (!endDate || now <= endDate);
                });
                break;
            case "upcoming":
                // Show exams that are published but haven't started yet
                const currentDate = new Date();
                exams = exams.filter(exam => {
                    if (!exam.publishedAt) return false;
                    const startDate = exam.startDate ? new Date(exam.startDate) : null;
                    return startDate && startDate > currentDate;
                });
                break;
            case "active":
                exams = exams.filter(exam => exam.publishedAt !== null);
                break;
            case "draft":
                exams = exams.filter(exam => exam.publishedAt === null);
                break;
        }

        // Filter by role
        if (userRole === "INSTRUCTOR" && userId) {
            exams = exams.filter(exam => exam.creatorId === userId);
        }

        return exams;
    }, [allExams, activeTab, userRole, userId, searchQuery]);

    const handleDeleteExam = async () => {
        if (!examToDelete) return;

        try {
            const response = await fetch(`/api/organization/${organizationId}/exams/${examToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete exam');
            }

            setAllExams(prevExams => prevExams.filter(exam => exam.id !== examToDelete.id));
            toast.success(`Exam "${examToDelete.title}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting exam:', error);
            toast.error(`Failed to delete exam "${examToDelete.title}"`);
        } finally {
            setDeleteDialogOpen(false);
            setExamToDelete(null);
        }
    };

    if (isLoading) {
        return <ExamListSkeleton />;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 lg:p-6 xl:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Exams</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            {userRole === "STUDENT"
                                ? "View and take your available exams"
                                : "Manage and create exams for your organization"}
                        </p>
                    </div>
                    {userRole && (
                        <Badge variant="outline" className="text-xs sm:text-sm">
                            {userRole}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search exams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tabs and Create Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs defaultValue={userRole === "STUDENT" ? "all" : "active"} className="w-full sm:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        {userRole === "STUDENT" ? (
                            <>
                                <TabsTrigger value="all" className="text-xs sm:text-sm">All Exams</TabsTrigger>
                                <TabsTrigger value="ongoing" className="text-xs sm:text-sm">Ongoing</TabsTrigger>
                                <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
                            </>
                        ) : (
                            <>
                                <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                                <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts</TabsTrigger>
                                <TabsTrigger value="all" className="text-xs sm:text-sm">All Exams</TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </Tabs>
                {(userRole === "OWNER" || userRole === "ADMIN" || userRole === "INSTRUCTOR") && (
                    <Button
                        onClick={() => router.push(`/organization/${organizationId}/exams/create`)}
                        className="w-full sm:w-auto"
                        size="sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                )}
            </div>

            {/* Exam Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                {filteredExams.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                        <h3 className="mt-4 text-lg font-semibold sm:text-xl">No exams found</h3>
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            {activeTab === "active"
                                ? "No active exams available"
                                : activeTab === "draft"
                                    ? "No draft exams available"
                                    : "No exams available"}
                        </p>
                        {(userRole === "OWNER" || userRole === "ADMIN" || userRole === "INSTRUCTOR") && (
                            <Button
                                onClick={() => router.push(`/organization/${organizationId}/exams/create`)}
                                className="mt-4"
                                size="sm"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Exam
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredExams.map((exam) => (
                        userRole === "STUDENT" ? (
                            <Card
                                key={exam.id}
                                className="group select-none transition-all duration-200 hover:bg-accent/5 hover:shadow-md"
                                onClick={() => router.push(`/organization/${organizationId}/exams/${exam.id}`)}
                            >
                                <CardHeader className="space-y-3 sm:space-y-4 md:space-y-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 sm:p-2.5 md:p-3">
                                                <FileText className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                                            </div>
                                            <CardTitle className="text-base line-clamp-1 sm:text-lg md:text-xl">
                                                {exam.title}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs line-clamp-2 sm:text-sm md:text-base">
                                        {exam.description || "No description available"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 md:space-y-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                                <span className="text-xs sm:text-sm">
                                                    {exam.timeLimit ? `${exam.timeLimit} min` : "No time limit"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <ListChecks className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                                <span className="text-xs sm:text-sm">
                                                    {exam.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                            <span className="text-xs sm:text-sm">
                                                {new Date(exam.startDate ? exam.startDate : exam.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <ContextMenu key={exam.id} modal={false}>
                                <ContextMenuTrigger asChild>
                                    <Card
                                        className="group select-none transition-all duration-200 hover:bg-accent/5 hover:shadow-md"
                                        onClick={() => router.push(`/organization/${organizationId}/exams/${exam.id}`)}
                                    >
                                        <CardHeader className="space-y-3 sm:space-y-4 md:space-y-6">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2 sm:p-2.5 md:p-3">
                                                        <FileText className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                                                    </div>
                                                    <CardTitle className="text-base line-clamp-1 sm:text-lg md:text-xl">
                                                        {exam.title}
                                                    </CardTitle>
                                                </div>
                                                <Badge variant="outline" className="text-xs sm:text-sm">
                                                    {exam.publishedAt ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs line-clamp-2 sm:text-sm md:text-base">
                                                {exam.description || "No description available"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3 md:space-y-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                                        <span className="text-xs sm:text-sm">
                                                            {exam.timeLimit ? `${exam.timeLimit} min` : "No time limit"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ListChecks className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                                        <span className="text-xs sm:text-sm">
                                                            {exam.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                                                    <span className="text-xs sm:text-sm">
                                                        {new Date(exam.startDate ? exam.startDate : exam.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    {(userRole === "OWNER" || userRole === "ADMIN" ||
                                      (userRole === "INSTRUCTOR" && exam.creatorId === userId)) && (
                                        <>
                                            <ContextMenuItem
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    router.push(`/organization/${organizationId}/exams/${exam.id}/edit`);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit Exam
                                            </ContextMenuItem>
                                            <ContextMenuItem
                                                onClick={(e: React.MouseEvent) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setExamToDelete(exam);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Exam
                                            </ContextMenuItem>
                                        </>
                                    )}
                                </ContextMenuContent>
                            </ContextMenu>
                        )
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the exam "{examToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteExam}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
