import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExamCardSkeleton() {
    return (
        <Card className="group">
            <CardHeader className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg md:h-10 md:w-10" />
                        <Skeleton className="h-5 w-32 md:h-6" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ExamListSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 lg:p-6 xl:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32 sm:h-9 lg:h-10" />
                        <Skeleton className="h-4 w-48 sm:h-5" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>

            {/* Tabs and Create Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Exam Cards Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                {[...Array(6)].map((_, index) => (
                    <ExamCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}
