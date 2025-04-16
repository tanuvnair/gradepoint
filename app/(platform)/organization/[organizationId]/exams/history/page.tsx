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
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface Exam {
    id: number;
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
        description?: string;
        questions: {
            content: string;
            type: string;
            points: number;
        }[];
    }[];
    attempt: {
        score: number;
        timeSpent: string;
        submittedAt: string;
        totalQuestions: number;
        correctAnswers: number;
    };
}

// Enhanced dummy data based on exam creation form
const examHistory: Exam[] = [
    {
        id: 1,
        title: "Mathematics Final",
        description: "Comprehensive mathematics exam covering algebra and calculus",
        timeLimit: 120,
        passingScore: 70,
        randomizeOrder: true,
        startDate: "2024-04-15T09:00:00Z",
        endDate: "2024-04-15T11:00:00Z",
        allowedAttempts: 2,
        sections: [
            {
                title: "Algebra",
                questions: [
                    { content: "Solve quadratic equation", type: "SHORT_ANSWER", points: 10 },
                    { content: "Factor polynomial", type: "SHORT_ANSWER", points: 10 },
                ]
            },
            {
                title: "Calculus",
                questions: [
                    { content: "Find derivative", type: "SHORT_ANSWER", points: 15 },
                    { content: "Calculate integral", type: "SHORT_ANSWER", points: 15 },
                ]
            }
        ],
        attempt: {
            score: 85,
            timeSpent: "1h 45m",
            submittedAt: "2024-04-15T10:45:00Z",
            totalQuestions: 4,
            correctAnswers: 3
        }
    },
    {
        id: 2,
        title: "Physics Midterm",
        description: "Midterm exam covering mechanics and thermodynamics",
        timeLimit: 90,
        passingScore: 60,
        randomizeOrder: false,
        startDate: "2024-03-20T10:00:00Z",
        endDate: "2024-03-20T11:30:00Z",
        allowedAttempts: 1,
        sections: [
            {
                title: "Mechanics",
                questions: [
                    { content: "Calculate force", type: "MULTIPLE_CHOICE", points: 10 },
                    { content: "Solve kinematics problem", type: "SHORT_ANSWER", points: 15 },
                ]
            },
            {
                title: "Thermodynamics",
                questions: [
                    { content: "Calculate heat transfer", type: "SHORT_ANSWER", points: 15 },
                    { content: "Explain entropy", type: "OPEN_ENDED", points: 10 },
                ]
            }
        ],
        attempt: {
            score: 92,
            timeSpent: "1h 20m",
            submittedAt: "2024-03-20T11:20:00Z",
            totalQuestions: 4,
            correctAnswers: 4
        }
    }
];

export default function ExamHistory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Exam; direction: 'ascending' | 'descending' } | null>(null);

    const filteredAndSortedExams = useMemo(() => {
        let filtered = [...examHistory];

        if (searchQuery) {
            filtered = filtered.filter(exam =>
                exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

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
    }, [examHistory, searchQuery, sortConfig]);

    const requestSort = (key: keyof Exam) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Calculate statistics
    const averageScore = examHistory.reduce((acc, exam) => acc + exam.attempt.score, 0) / examHistory.length;
    const totalExams = examHistory.length;
    const highestScore = Math.max(...examHistory.map(exam => exam.attempt.score));
    const totalQuestions = examHistory.reduce((acc, exam) => acc + exam.attempt.totalQuestions, 0);
    const totalCorrectAnswers = examHistory.reduce((acc, exam) => acc + exam.attempt.correctAnswers, 0);
    const totalTimeSpent = examHistory.reduce((acc, exam) => {
        const [hours, minutes] = exam.attempt.timeSpent.split('h ').map(part =>
            part.includes('m') ? parseInt(part) / 60 : parseInt(part)
        );
        return acc + (hours || 0) + (minutes || 0);
    }, 0);

    // Calculate section-wise performance
    const sectionStats = useMemo(() => {
        const stats: Record<string, { total: number; count: number; avgScore: number }> = {};
        examHistory.forEach(exam => {
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
    }, [examHistory]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                        <Progress value={averageScore} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {highestScore}% highest score
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
                        <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(totalTimeSpent)}h</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(totalTimeSpent / totalExams).toFixed(1)}h per exam
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Section</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.entries(sectionStats).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][0]}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Object.entries(sectionStats).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][1].avgScore.toFixed(1)}% average
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
                                placeholder="Search exams..."
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
                                    Your Score
                                </TableHead>
                                <TableHead onClick={() => requestSort('attempt.timeSpent')} className="cursor-pointer">
                                    Time Spent
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedExams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            {exam.title}
                                            <p className="text-xs text-muted-foreground">{exam.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(exam.startDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{exam.timeLimit} minutes</TableCell>
                                    <TableCell>{exam.passingScore}%</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {exam.attempt.score}%
                                            <Progress value={exam.attempt.score} className="w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.attempt.timeSpent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
