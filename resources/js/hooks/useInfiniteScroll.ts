import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
}

export function useInfiniteScroll(
    loadMore: () => void,
    options: UseInfiniteScrollOptions
) {
    const { hasMore, loading, threshold = 100 } = options;
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            {
                rootMargin: `${threshold}px`,
            }
        );

        if (node) {
            observerRef.current.observe(node);
        }
    }, [loading, hasMore, loadMore, threshold]);

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { lastElementRef, loadingRef };
}

interface UseVirtualizedDataOptions<T> {
    data: T[];
    itemsPerPage: number;
    searchQuery?: string;
    filterType?: string;
}

export function useVirtualizedData<T>({
    data,
    itemsPerPage,
    searchQuery = '',
    filterType = 'all'
}: UseVirtualizedDataOptions<T>) {
    const [displayedData, setDisplayedData] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Reset when search/filter changes
    useEffect(() => {
        setDisplayedData(data.slice(0, itemsPerPage));
        setCurrentPage(1);
    }, [data, searchQuery, filterType, itemsPerPage]);

    const loadMore = useCallback(async () => {
        if (loading) return;

        setLoading(true);

        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newItems = data.slice(startIndex, endIndex);

        if (newItems.length > 0) {
            setDisplayedData(prev => [...prev, ...newItems]);
            setCurrentPage(nextPage);
        }

        setLoading(false);
    }, [currentPage, data, itemsPerPage, loading]);

    const hasMore = displayedData.length < data.length;

    return {
        displayedData,
        loadMore,
        loading,
        hasMore,
        currentPage
    };
}
