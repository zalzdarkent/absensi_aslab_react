import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send, ShieldCheck, AlertTriangle, Filter, Grid3X3, List, RotateCcw } from 'lucide-react';
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
        shouldUseCache,
        isExpired
    } = useProductCache();

    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(meta?.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'aset' | 'bahan'>((meta?.type as 'all' | 'aset' | 'bahan') || 'all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isUsingCache, setIsUsingCache] = useState(false);

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
    }, [items, pagination.current_page]);

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

    const handleSubmit = async () => {
        if (getTotalItems() === 0) {
            toast.error('Keranjang kosong', {
                description: 'Pilih minimal satu barang untuk dipinjam/digunakan'
            });
            return;
        }

        if (!agreementAccepted) {
            toast.error('Persetujuan diperlukan', {
                description: 'Anda harus menyetujui syarat dan ketentuan'
            });
            return;
        }

        // Check return dates only for aset items
        const today = new Date().toISOString().split('T')[0];
        const asetItems = cartItems.filter(item => item.type === 'aset');
        const invalidAsetItems = asetItems.filter(item => item.targetReturnDate <= today);

        if (invalidAsetItems.length > 0) {
            toast.error('Tanggal pengembalian tidak valid', {
                description: 'Tanggal pengembalian aset harus setelah hari ini'
            });
            return;
        }

        setIsSubmitting(true);

        router.post('/peminjaman-barang', {
            items: JSON.stringify(cartItems.map(item => ({
                item_id: item.id,
                item_type: item.type,
                quantity: item.quantity,
                target_return_date: item.type === 'aset' ? item.targetReturnDate : null, // Only for aset
                note: item.note || ''
            }))),
            agreement_accepted: agreementAccepted ? 1 : 0
        }, {
            onSuccess: () => {
                toast.success('Permintaan berhasil dikirim', {
                    description: 'Semua permintaan menunggu persetujuan admin/aslab'
                });
                // Clear cart after successful submission
                clearCart();
                setAgreementAccepted(false);
            },
            onError: () => {
                toast.error('Gagal mengirim permintaan', {
                    description: 'Silakan coba lagi'
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const canSubmit = getTotalItems() > 0 && agreementAccepted && !isSubmitting;

    return (
        <AppLayout>
            <Head title="Ajukan Peminjaman Barang" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3 lg:gap-4">
                            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                                <Link href="/peminjaman-barang">
                                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                                    Kembali
                                </Link>
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Katalog Peminjaman</h1>
                                <p className="text-muted-foreground mt-1 text-sm lg:text-base">Pilih barang yang ingin dipinjam</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <CartDrawer
                                items={cartItems}
                                onUpdateQuantity={updateQuantity}
                                onUpdateReturnDate={updateReturnDate}
                                onUpdateNote={updateNote}
                                onRemoveItem={handleRemoveFromCart}
                                onClearCart={handleClearCart}
                            />
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex-1 max-w-md">
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

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Filter Buttons */}
                                    <div className="flex bg-muted rounded-lg p-1">
                                        <Button
                                            variant={filterType === 'all' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('all')}
                                        >
                                            Semua
                                        </Button>
                                        <Button
                                            variant={filterType === 'aset' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('aset')}
                                        >
                                            Aset
                                        </Button>
                                        <Button
                                            variant={filterType === 'bahan' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilterType('bahan')}
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
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
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
                                    <CardContent className="py-12">
                                        <div className="text-center">
                                            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-foreground mb-2">
                                                Tidak ada barang ditemukan
                                            </h3>
                                            <p className="text-muted-foreground">
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
                                                >
                                                    Hapus pencarian
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {/* Loading State */}
                                    {isSearching && (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            <span className="ml-3 text-muted-foreground">Memuat data...</span>
                                        </div>
                                    )}

                                    {/* Products */}
                                    {!isSearching && (
                                        <div className={cn(
                                            viewMode === 'grid'
                                                ? "grid gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
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
                                                            viewMode === 'list' ? 'flex-row w-full' : 'w-full'
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Loading More Indicator */}
                                    {isLoadingMore && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="ml-3 text-muted-foreground">Memuat lebih banyak...</span>
                                        </div>
                                    )}

                                    {/* Results Info */}
                                    {!isSearching && !isLoadingMore && allLoadedItems.length > 0 && (
                                        <div className="text-center py-4 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
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
                                            <div className="flex justify-center gap-2 mt-3">
                                                {(searchQuery || filterType !== 'all') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setFilterType('all');
                                                        }}
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
                        <div className="space-y-4 xl:space-y-6 order-2 xl:order-2">
                            {/* Cart Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base lg:text-lg">Ringkasan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 lg:space-y-3 text-sm">
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

                            {/* Agreement */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive text-base lg:text-lg">
                                        <ShieldCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                                        Syarat & Ketentuan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 lg:space-y-4">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 lg:p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium mb-2">Dengan menggunakan sistem ini, saya berjanji:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li><strong>Aset (alat):</strong> Dipinjam dan harus dikembalikan sesuai jadwal</li>
                                                    <li><strong>Bahan:</strong> Digunakan/dikonsumsi dan tidak perlu dikembalikan</li>
                                                    <li>Mengganti rugi jika terjadi kerusakan atau kehilangan</li>
                                                    <li>Menggunakan hanya untuk keperluan akademik/praktikum</li>
                                                    <li>Mematuhi semua peraturan laboratorium yang berlaku</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="agreement"
                                            checked={agreementAccepted}
                                            onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="agreement"
                                            className="text-sm font-medium text-foreground cursor-pointer"
                                        >
                                            Saya menyetujui syarat dan ketentuan di atas *
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Card>
                                <CardContent className="pt-4 lg:pt-6">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Ajukan Permintaan ({getTotalItems()})
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-2">
                                        Semua permintaan dikirim ke admin/aslab untuk persetujuan
                                    </p>
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
        </AppLayout>
    );
}
