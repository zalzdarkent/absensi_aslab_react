import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
    return (
        <Card className={cn("border-border bg-card", className)}>
            <CardHeader className="p-4 pb-2">
                {/* Image Skeleton */}
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                    <Skeleton className="w-full h-full" />
                    {/* Badge Skeleton */}
                    <div className="absolute top-2 right-2">
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                {/* Product Info Skeleton */}
                <div className="space-y-2 mb-4">
                    {/* Title */}
                    <Skeleton className="h-5 w-3/4" />
                    {/* Code */}
                    <Skeleton className="h-4 w-1/2" />

                    {/* Stock Info */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                </div>
            </CardContent>
        </Card>
    );
}
