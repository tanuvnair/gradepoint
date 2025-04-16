"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Exam {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    randomizeOrder: boolean;
    startDate: string;
    endDate: string;
    allowedAttempts: number;
    sections: {
        title: string;
        description: string;
        questions: {
            id: string;
            content: string;
            type: string;
            points: number;
            options?: Record<string, string>;
        }[];
    }[];
    attempt: {
        userId: string;
        studentName: string;
        score: number;
        timeSpent: string;
        submittedAt: string;
        totalQuestions: number;
        correctAnswers: number;
    };
}

interface ExamResponse {
    questionId: string;
    content: string;
    type: string;
    points: number;
    response: string;
    isCorrect: boolean;
    score: number;
    feedback?: string;
    correctAnswer?: string;
    options?: Record<string, string>;
}

export default function ExamHistory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Exam | 'attempt.studentName' | 'attempt.score' | 'attempt.timeSpent'; direction: 'ascending' | 'descending' } | null>(null);
    const [userRole, setUserRole] = useState<"STUDENT" | "ADMIN" | "INSTRUCTOR" | "OWNER">("STUDENT");
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [examResponses, setExamResponses] = useState<ExamResponse[]>([]);
    const [isLoadingResponses, setIsLoadingResponses] = useState(false);

    const pathname = usePathname();
    const pathSegments = pathname.split("/");
    const organizationId = pathSegments[2];

    useEffect(() => {
        const fetchExamHistory = async () => {
            try {
                const response = await fetch(`/api/organization/${organizationId}/exams/history`);
                const data = await response.json();
                
                if (data.exams) {
                    setExams(data.exams);
                }
                if (data.userRole) {
                    setUserRole(data.userRole);
                }
                if (data.userId) {
                    setCurrentUserId(data.userId);
                }
            } catch (error) {
                console.error("Error fetching exam history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExamHistory();
    }, [organizationId]);

    const filteredAndSortedExams = useMemo(() => {
        let filtered = [...exams];

        if (searchQuery) {
            filtered = filtered.filter(exam =>
                exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (userRole !== "STUDENT" && exam.attempt.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key.startsWith('attempt.')) {
                    const attemptKey = sortConfig.key.split('.')[1] as keyof typeof a.attempt;
                    aValue = a.attempt[attemptKey];
                    bValue = b.attempt[attemptKey];
                } else {
                    aValue = a[sortConfig.key as keyof Exam];
                    bValue = b[sortConfig.key as keyof Exam];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [exams, searchQuery, sortConfig, userRole]);

    const requestSort = (key: keyof Exam | 'attempt.studentName' | 'attempt.score' | 'attempt.timeSpent') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Calculate statistics
    const relevantExams = userRole === "STUDENT" 
        ? exams.filter(exam => exam.attempt.userId === currentUserId)
        : exams;

    const averageScore = relevantExams.length > 0 
        ? relevantExams.reduce((acc, exam) => acc + exam.attempt.score, 0) / relevantExams.length 
        : 0;
    const totalExams = relevantExams.length;
    const highestScore = relevantExams.length > 0 
        ? Math.max(...relevantExams.map(exam => exam.attempt.score)) 
        : 0;
    const totalQuestions = relevantExams.reduce((acc, exam) => acc + exam.attempt.totalQuestions, 0);
    const totalCorrectAnswers = relevantExams.reduce((acc, exam) => acc + exam.attempt.correctAnswers, 0);
    const totalTimeSpent = relevantExams.reduce((acc, exam) => {
        const [hours, minutes] = exam.attempt.timeSpent.split('h ').map(part =>
            part.includes('m') ? parseInt(part) / 60 : parseInt(part)
        );
        return acc + (hours || 0) + (minutes || 0);
    }, 0);

    // Calculate section-wise performance
    const sectionStats = useMemo(() => {
        const stats: Record<string, { total: number; count: number; avgScore: number }> = {};
        relevantExams.forEach(exam => {
            exam.sections.forEach(section => {
                if (!stats[section.title]) {
                    stats[section.title] = { total: 0, count: 0, avgScore: 0 };
                }
                const sectionScore = exam.attempt.score * (section.questions.reduce((acc, q) => acc + q.points, 0) /
                    exam.sections.reduce((acc, s) => acc + s.questions.reduce((a, q) => a + q.points, 0), 0));
                stats[section.title].total += sectionScore;
                stats[section.title].count += 1;
                stats[section.title].avgScore = stats[section.title].total / stats[section.title].count;
            });
        });
        return stats;
    }, [relevantExams]);

    const fetchExamResponses = async (examId: string, attemptId: string) => {
        setIsLoadingResponses(true);
        try {
            const response = await fetch(`/api/organization/${organizationId}/exams/${examId}/attempt/${attemptId}/responses`);
            const data = await response.json();
            if (data.responses) {
                setExamResponses(data.responses);
            }
        } catch (error) {
            console.error("Error fetching exam responses:", error);
        } finally {
            setIsLoadingResponses(false);
        }
    };

    const handleExamClick = async (exam: Exam) => {
        setSelectedExam(exam);
        // The attempt ID is not directly available in the exam data, so we need to fetch it
        try {
            const response = await fetch(`/api/organization/${organizationId}/exams/${exam.id}/attempts?userId=${exam.attempt.userId}`);
            const data = await response.json();
            if (data.attempts && data.attempts.length > 0) {
                const attempt = data.attempts.find((a: any) => 
                    new Date(a.submittedAt).toISOString() === exam.attempt.submittedAt
                );
                if (attempt) {
                    await fetchExamResponses(exam.id, attempt.id);
                }
            }
        } catch (error) {
            console.error("Error fetching attempt ID:", error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                        <Progress value={(averageScore / 100) * 100} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {highestScore} highest score
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuestions}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalCorrectAnswers} correct answers ({(totalCorrectAnswers / totalQuestions * 100).toFixed(1)}%)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Section</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.entries(sectionStats).length > 0 
                                ? Object.entries(sectionStats).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][0]
                                : "No data"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Object.entries(sectionStats).length > 0
                                ? `${Object.entries(sectionStats).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][1].avgScore.toFixed(1)} average`
                                : "No attempts yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Exam History</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={userRole === "STUDENT" ? "Search your exams..." : "Search all exams..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => requestSort('title')} className="cursor-pointer">
                                    Exam
                                </TableHead>
                                {userRole !== "STUDENT" && (
                                    <TableHead onClick={() => requestSort('attempt.studentName')} className="cursor-pointer">
                                        Student
                                    </TableHead>
                                )}
                                <TableHead onClick={() => requestSort('startDate')} className="cursor-pointer">
                                    Date
                                </TableHead>
                                <TableHead onClick={() => requestSort('timeLimit')} className="cursor-pointer">
                                    Duration
                                </TableHead>
                                <TableHead onClick={() => requestSort('passingScore')} className="cursor-pointer">
                                    Passing Score
                                </TableHead>
                                <TableHead onClick={() => requestSort('attempt.score')} className="cursor-pointer">
                                    Score
                                </TableHead>
                                <TableHead onClick={() => requestSort('attempt.timeSpent')} className="cursor-pointer">
                                    Time Spent
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedExams.map((exam) => (
                                <TableRow 
                                    key={exam.id} 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleExamClick(exam)}
                                >
                                    <TableCell className="font-medium">
                                        <div>
                                            {exam.title}
                                            <p className="text-xs text-muted-foreground">{exam.description}</p>
                                        </div>
                                    </TableCell>
                                    {userRole !== "STUDENT" && (
                                        <TableCell>{exam.attempt.studentName}</TableCell>
                                    )}
                                    <TableCell>
                                        {new Date(exam.attempt.submittedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{exam.timeLimit} minutes</TableCell>
                                    <TableCell>{exam.passingScore}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {exam.attempt.score}
                                            <Progress 
                                                value={(exam.attempt.score / exam.sections.reduce((total, section) => 
                                                    total + section.questions.reduce((sum, q) => sum + q.points, 0), 0)) * 100} 
                                                className="w-20" 
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.attempt.timeSpent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedExam?.title} - {selectedExam?.attempt.studentName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {isLoadingResponses ? (
                            <div>Loading answers...</div>
                        ) : (
                            selectedExam?.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="space-y-4">
                                    <h3 className="text-lg font-semibold">{section.title}</h3>
                                    {section.description && (
                                        <p className="text-sm text-muted-foreground">{section.description}</p>
                                    )}
                                    <div className="space-y-4">
                                        {section.questions.map((question, questionIndex) => {
                                            const response = examResponses.find(r => r.questionId === question.id);
                                            return (
                                                <div key={questionIndex} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{question.content}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Points: {question.points}
                                                            </p>
                                                        </div>
                                                        {response && (
                                                            <div className={`px-2 py-1 rounded ${
                                                                response.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {response.score} / {question.points}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {response && (
                                                        <div className="mt-4 space-y-2">
                                                            <div>
                                                                <p className="text-sm font-medium">Your Answer:</p>
                                                                <p className="text-sm">
                                                                    {question.type === "MULTIPLE_CHOICE" && question.options
                                                                        ? question.options[response.response] || response.response
                                                                        : response.response}
                                                                </p>
                                                            </div>
                                                            {question.type === "MULTIPLE_CHOICE" && response.correctAnswer && (
                                                                <div>
                                                                    <p className="text-sm font-medium">Correct Answer:</p>
                                                                    <p className="text-sm">
                                                                        {question.options
                                                                            ? question.options[response.correctAnswer] || response.correctAnswer
                                                                            : response.correctAnswer}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {response.feedback && (
                                                                <div>
                                                                    <p className="text-sm font-medium">Feedback:</p>
                                                                    <p className="text-sm">{response.feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
