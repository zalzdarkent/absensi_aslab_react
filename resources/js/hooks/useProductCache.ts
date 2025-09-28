import { useState, useEffect } from 'react';

interface Product {
    id: number;
    nama_aset?: string;
    nama?: string;
    kode_aset?: string;
    kode?: string;
    stok: number;
    gambar?: string;
    type: 'aset' | 'bahan';
}

interface CacheData {
    items: Product[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        has_more: boolean;
        total_pages: number;
        from: number;
        to: number;
    };
    meta: {
        search: string;
        type: string;
        total_asets: number;
        total_bahans: number;
    };
    timestamp: number;
    scrollPosition: number;
}

const CACHE_KEY = 'product-catalog-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useProductCache() {
    const [cachedData, setCachedData] = useState<CacheData | null>(null);

    // Load cache from localStorage on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsedCache: CacheData = JSON.parse(cached);

                // Check if cache is still valid (not expired)
                if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
                    setCachedData(parsedCache);
                } else {
                    // Cache expired, remove it
                    localStorage.removeItem(CACHE_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading cache:', error);
            localStorage.removeItem(CACHE_KEY);
        }
    }, []);

    const saveToCache = (
        items: Product[],
        pagination: CacheData['pagination'],
        meta: CacheData['meta'],
        scrollPosition: number = 0
    ) => {
        try {
            const cacheData: CacheData = {
                items,
                pagination,
                meta,
                timestamp: Date.now(),
                scrollPosition
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            setCachedData(cacheData);
        } catch (error) {
            console.error('Error saving to cache:', error);
            // If storage is full, clear old cache and try again
            localStorage.removeItem(CACHE_KEY);
        }
    };

    const updateCacheItems = (newItems: Product[], newPagination: CacheData['pagination']) => {
        if (!cachedData) return;

        try {
            const updatedCache: CacheData = {
                ...cachedData,
                items: newItems,
                pagination: newPagination,
                timestamp: Date.now() // Update timestamp
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
            setCachedData(updatedCache);
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    };

    const updateScrollPosition = (scrollPosition: number) => {
        if (!cachedData) return;

        try {
            const updatedCache: CacheData = {
                ...cachedData,
                scrollPosition,
                timestamp: Date.now()
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
            setCachedData(updatedCache);
        } catch (error) {
            console.error('Error updating scroll position:', error);
        }
    };

    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY);
        setCachedData(null);
    };

    const isCacheValid = (search: string, type: string): boolean => {
        if (!cachedData) return false;

        // Cache is only valid if search and type parameters match
        return cachedData.meta.search === search && cachedData.meta.type === type;
    };

    const shouldUseCache = (search: string, type: string, page: number): boolean => {
        if (!cachedData) return false;

        // Only use cache if:
        // 1. Parameters match
        // 2. We're requesting page 1 (initial load)
        // 3. Cache is still valid
        return isCacheValid(search, type) &&
               page === 1 &&
               (Date.now() - cachedData.timestamp < CACHE_DURATION);
    };

    return {
        cachedData,
        saveToCache,
        updateCacheItems,
        updateScrollPosition,
        clearCache,
        isCacheValid,
        shouldUseCache,
        isExpired: cachedData ? (Date.now() - cachedData.timestamp >= CACHE_DURATION) : true
    };
}
