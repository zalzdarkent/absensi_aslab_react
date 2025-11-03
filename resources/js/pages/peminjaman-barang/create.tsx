import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Filter, Grid3X3, List, RotateCcw } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ProductCard } from '@/components/ui/product-card';
import { CartDrawer } from '@/components/ui/cart-drawer';
import { ProductDetailModal } from '@/components/ui/product-detail-modal';
import { AutoComplete } from '@/components/ui/auto-complete';
import { useCartStorage, CartItem } from '@/hooks/useCartStorage';
import { useProductCache } from '@/hooks/useProductCache';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface Props {
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
}

export default function PeminjamanBarangCreate({ items, pagination, meta }: Props) {
    // Use cart storage hook for persistent cart
    const {
        cartItems,
        addToCart,
        updateQuantity,
        updateReturnDate,
        updateNote,
        removeFromCart,
        clearCart,
        findCartItem,
        getTotalItems,
        getTotalQuantity
    } = useCartStorage();

    // Use product cache hook for caching loaded data
    const {
        cachedData,
        saveToCache,
        updateCacheItems,
        updateScrollPosition,
        clearCache,
        shouldUseCache
    } = useProductCache();

    const [searchQuery, setSearchQuery] = useState(meta?.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'aset' | 'bahan'>((meta?.type as 'all' | 'aset' | 'bahan') || 'all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isUsingCache, setIsUsingCache] = useState(false);
    const [cartAnimation, setCartAnimation] = useState(false);

    // Use ref to track if we're using cache to avoid loops
    const isInitialCacheLoad = React.useRef(false);

    // Initialize state with cache or fresh data
    const [allLoadedItems, setAllLoadedItems] = useState<Product[]>(() => {
        // Check if we should use cached data
        if (shouldUseCache(meta?.search || '', meta?.type || 'all', pagination.current_page)) {
            setIsUsingCache(true);
            isInitialCacheLoad.current = true;
            return cachedData?.items || items || [];
        }
        return items || [];
    });

    // Initialize pagination state
    const [currentPagination, setCurrentPagination] = useState(() => {
        if (shouldUseCache(meta?.search || '', meta?.type || 'all', pagination.current_page) && cachedData?.pagination) {
            return cachedData.pagination;
        }
        return pagination;
    });

    // Update accumulated items when new data comes in
    React.useEffect(() => {
        // Skip the first effect if we loaded from cache
        if (isInitialCacheLoad.current) {
            isInitialCacheLoad.current = false;
            setIsUsingCache(false);
            return;
        }

        if (pagination.current_page === 1) {
            // New search/filter - replace all items
            setAllLoadedItems(items || []);
            setCurrentPagination(pagination);
        } else {
            // Load more - append to existing items
            setAllLoadedItems(prev => [...prev, ...(items || [])]);
            setCurrentPagination(pagination);
        }
    }, [items, pagination]);

    // Cache management - separate from state updates to avoid loops
    React.useEffect(() => {
        // Only cache if we have items and we're not in cache restoration mode
        if (items && items.length > 0 && !isInitialCacheLoad.current) {
            if (pagination.current_page === 1) {
                // Save fresh data to cache with delay to avoid loops
                const timeoutId = setTimeout(() => saveToCache(items, pagination, meta), 0);
                return () => clearTimeout(timeoutId);
            } else if (allLoadedItems.length > items.length) {
                // Update cache with accumulated items with delay
                const timeoutId = setTimeout(() => updateCacheItems(allLoadedItems, pagination), 0);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [items, pagination, meta, allLoadedItems, saveToCache, updateCacheItems]); // Full dependencies with timeout protection

    // Restore scroll position from cache
    React.useEffect(() => {
        if (cachedData?.scrollPosition && isUsingCache) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                window.scrollTo({
                    top: cachedData.scrollPosition,
                    behavior: 'auto'
                });
                toast.success('Data dikembalikan dari cache', {
                    description: `Posisi scroll dan ${cachedData.items.length} item dipulihkan`
                });
            }, 100);
        }
    }, [cachedData, isUsingCache]);

    // Throttled scroll handler
    const throttledUpdateScrollPosition = React.useCallback(() => {
        let ticking = false;
        return () => {
            if (!ticking && allLoadedItems.length > 24) {
                requestAnimationFrame(() => {
                    updateScrollPosition(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }, [updateScrollPosition, allLoadedItems.length]);

    // Save scroll position to cache periodically
    React.useEffect(() => {
        const scrollHandler = throttledUpdateScrollPosition();
        window.addEventListener('scroll', scrollHandler);

        return () => {
            window.removeEventListener('scroll', scrollHandler);
        };
    }, [throttledUpdateScrollPosition]);

    // Handle search with debounce (this will reset to page 1)
    const performSearch = (query: string, type: string) => {
        setIsSearching(true);

        router.get('/peminjaman-barang/create', {
            search: query,
            type: type,
            page: 1 // Always start from page 1 for new search
        }, {
            preserveState: false, // Don't preserve state for new search
            preserveScroll: false,
            onFinish: () => {
                setIsSearching(false);
            }
        });
    };

    // Handle load more (append to current data)
    const loadMoreItems = React.useCallback(() => {
        if (!currentPagination.has_more || isLoadingMore) return;

        setIsLoadingMore(true);

        router.get('/peminjaman-barang/create', {
            search: searchQuery,
            type: filterType,
            page: currentPagination.current_page + 1
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsLoadingMore(false);
            }
        });
    }, [currentPagination.has_more, currentPagination.current_page, isLoadingMore, searchQuery, filterType]);

    // Debounced search effect
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== (meta?.search || '') || filterType !== (meta?.type || 'all')) {
                performSearch(searchQuery, filterType);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filterType, meta?.search, meta?.type]);

    // Create search suggestions from current loaded data
    const searchSuggestions = React.useMemo(() => {
        if (!searchQuery) return [];

        return allLoadedItems
            .map(product => product.nama_aset || product.nama || '')
            .filter(name => name && name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter((name, index, self) => self.indexOf(name) === index) // unique
            .slice(0, 8);
    }, [allLoadedItems, searchQuery]);

    // Infinite scroll observer
    const lastElementRef = React.useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore || isSearching) return;

        if (node) {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting && currentPagination.has_more) {
                    loadMoreItems();
                }
            }, {
                rootMargin: '100px' // Start loading 100px before reaching the bottom
            });

            observer.observe(node);

            return () => observer.disconnect();
        }
    }, [isLoadingMore, isSearching, currentPagination.has_more, loadMoreItems]);

    const handleAddToCart = (product: Product) => {
        const existingItem = findCartItem(product.id, product.type);

        // Trigger cart animation
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), 600);

        if (existingItem) {
            if (existingItem.quantity < product.stok) {
                updateQuantity(product.id, product.type, existingItem.quantity + 1);
                toast.success('Jumlah ditambah', {
                    description: `${product.nama_aset || product.nama} sekarang ${existingItem.quantity + 1} unit`
                });
            } else {
                toast.warning('Stok tidak mencukupi');
            }
            return;
        }

        const newCartItem: CartItem = {
            id: product.id,
            name: product.nama_aset || product.nama || 'Unknown',
            code: product.kode_aset || product.kode || 'N/A',
            type: product.type,
            unit: 'unit', // Default unit since no satuan column
            maxStock: product.stok,
            quantity: 1,
            targetReturnDate: getTomorrowDate(),
            note: ''
        };

        addToCart(newCartItem);
        toast.success('Ditambahkan ke keranjang', {
            description: `${newCartItem.name} berhasil ditambahkan`
        });
    };

    const handleViewDetail = (product: Product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleClearCart = () => {
        clearCart();
        toast.success('Keranjang dikosongkan');
    };

    const handleRemoveFromCart = (id: number, type: 'aset' | 'bahan') => {
        removeFromCart(id, type);
        toast.success('Barang dihapus dari keranjang');
    };

    return (
        <AppLayout>
            <Head title="Ajukan Peminjaman Barang" />

            <div className="space-y-6 py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
                            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                                <Link href="/peminjaman-barang">
                                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                    <span className="text-xs sm:text-sm">Kembali</span>
                                </Link>
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground">
                                    Katalog Peminjaman
                                </h1>
                                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
                                    Pilih barang yang ingin dipinjam
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                                <div className="flex-1 max-w-sm">
                                    <AutoComplete
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        placeholder="Cari ESP32, resistor, dll..."
                                        suggestions={searchSuggestions}
                                        onSuggestionSelect={setSearchQuery}
                                    />
                                    {cachedData && isUsingCache && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            📥 Data dipulihkan dari cache ({cachedData.items.length} item)
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                                    {/* Filter Buttons */}
                                    <div className="flex bg-muted rounded-lg p-1">
                                        <Button
                                            variant={filterType === 'all' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('all')}
                                            className="text-xs px-2 sm:px-3"
                                        >
                                            Semua
                                        </Button>
                                        <Button
                                            variant={filterType === 'aset' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('aset')}
                                            className="text-xs px-2 sm:px-3"
                                        >
                                            Aset
                                        </Button>
                                        <Button
                                            variant={filterType === 'bahan' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('bahan')}
                                            className="text-xs px-2 sm:px-3"
                                        >
                                            Bahan
                                        </Button>
                                    </div>

                                    {/* View Mode Toggle */}
                                    <div className="flex bg-muted rounded-lg p-1">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="px-2"
                                        >
                                            <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="px-2"
                                        >
                                            <List className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                        {/* Products Grid */}
                        <div className="xl:col-span-3 order-1 xl:order-1">
                            {allLoadedItems.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 sm:py-12">
                                        <div className="text-center">
                                            <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                                                Tidak ada barang ditemukan
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {searchQuery
                                                    ? `Tidak ada hasil untuk "${searchQuery}"`
                                                    : "Pilih filter atau ubah pencarian Anda"
                                                }
                                            </p>
                                            {searchQuery && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-4"
                                                    size="sm"
                                                >
                                                    Hapus pencarian
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Loading State */}
                                    {isSearching && (
                                        <div className="flex items-center justify-center py-8 sm:py-12">
                                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                                            <span className="ml-3 text-sm text-muted-foreground">Memuat data...</span>
                                        </div>
                                    )}

                                    {/* Products */}
                                    {!isSearching && (
                                        <div className={cn(
                                            viewMode === 'grid'
                                                ? "grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
                                                : "space-y-3"
                                        )}>
                                            {allLoadedItems.map((product, index) => (
                                                <div
                                                    key={`${product.type}-${product.id}`}
                                                    ref={index === allLoadedItems.length - 1 ? lastElementRef : null}
                                                    className="w-full"
                                                >
                                                    <ProductCard
                                                        product={product}
                                                        onAddToCart={handleAddToCart}
                                                        onViewDetail={handleViewDetail}
                                                        className={cn(
                                                            "h-full",
                                                            viewMode === 'list' ? 'flex-row w-full' : 'w-full',
                                                            viewMode === 'grid' ? 'text-xs sm:text-sm' : ''
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Loading More Indicator */}
                                    {isLoadingMore && (
                                        <div className="flex items-center justify-center py-6 sm:py-8">
                                            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                                            <span className="ml-3 text-sm text-muted-foreground">Memuat lebih banyak...</span>
                                        </div>
                                    )}

                                    {/* Results Info */}
                                    {!isSearching && !isLoadingMore && allLoadedItems.length > 0 && (
                                        <div className="text-center py-3 sm:py-4 border-t border-border">
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                Menampilkan {currentPagination.from} - {currentPagination.to} dari {currentPagination.total} barang
                                                {meta?.total_asets && meta?.total_bahans && (
                                                    <span className="block text-xs mt-1">
                                                        Database: {meta.total_asets} aset, {meta.total_bahans} bahan
                                                    </span>
                                                )}
                                            </p>
                                            {currentPagination.has_more && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Scroll ke bawah untuk melihat lebih banyak
                                                </p>
                                            )}
                                            {!currentPagination.has_more && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    ✨ Semua data telah ditampilkan
                                                </p>
                                            )}
                                            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-3">
                                                {(searchQuery || filterType !== 'all') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setFilterType('all');
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        Tampilkan Semua
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        clearCache();
                                                        toast.success('Cache dihapus');
                                                    }}
                                                    className="text-xs"
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                    Hapus Cache
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Agreement & Summary */}
                        <div className="space-y-3 sm:space-y-4 xl:space-y-6 order-2 xl:order-2">
                            {/* Cart Summary */}
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-sm sm:text-base lg:text-lg">Ringkasan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 lg:space-y-3 text-xs sm:text-sm">
                                        <div className="flex justify-between">
                                            <span>Total item:</span>
                                            <span className="font-medium">{getTotalItems()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total unit:</span>
                                            <span className="font-medium">
                                                {getTotalQuantity()}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="text-xs text-muted-foreground">
                                                <div>Status: <span className="text-yellow-600 dark:text-yellow-400 font-medium">Perlu Persetujuan</span></div>
                                                <div className="mt-1 text-xs">Aset: dipinjam | Bahan: digunakan</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                        </div>
                    </div>
                </div>
            </div>

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onAddToCart={handleAddToCart}
            />

            {/* Floating Cart Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <CartDrawer
                    items={cartItems}
                    onUpdateQuantity={updateQuantity}
                    onUpdateReturnDate={updateReturnDate}
                    onUpdateNote={updateNote}
                    onRemoveItem={handleRemoveFromCart}
                    onClearCart={handleClearCart}
                    isAnimating={cartAnimation}
                />
            </div>
        </AppLayout>
    );
}
