import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send, ShieldCheck, AlertTriangle, Filter, Grid3X3, List } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ProductCard } from '@/components/ui/product-card';
import { ProductCardSkeleton } from '@/components/ui/product-card-skeleton';
import { CartDrawer } from '@/components/ui/cart-drawer';
import { ProductDetailModal } from '@/components/ui/product-detail-modal';
import { AutoComplete } from '@/components/ui/auto-complete';
import { useVirtualizedData, useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useCartStorage, CartItem } from '@/hooks/useCartStorage';
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
    asets: Product[];
    bahans: Product[];
}

export default function PeminjamanBarangCreate({ asets, bahans }: Props) {
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

    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'aset' | 'bahan'>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Combine all products
    const allProducts: Product[] = useMemo(() => [
        ...asets.map(item => ({ ...item, type: 'aset' as const })),
        ...bahans.map(item => ({ ...item, type: 'bahan' as const }))
    ], [asets, bahans]);

    // Filter products based on search and type
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const name = product.nama_aset || product.nama || '';
            const code = product.kode_aset || product.kode || '';

            const matchesSearch = searchQuery === '' ||
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                code.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === 'all' || product.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [allProducts, searchQuery, filterType]);

    // Virtualized data with infinite scroll
    const {
        displayedData,
        loadMore,
        loading: virtualLoading,
        hasMore
    } = useVirtualizedData({
        data: filteredProducts,
        itemsPerPage: 12, // Show 12 items per page
        searchQuery,
        filterType
    });

    // Infinite scroll hook
    const { lastElementRef } = useInfiniteScroll(loadMore, {
        hasMore,
        loading: virtualLoading
    });

    // Create search suggestions
    const searchSuggestions = useMemo(() => {
        return allProducts
            .map(product => product.nama_aset || product.nama || '')
            .filter(name => name && name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter((name, index, self) => self.indexOf(name) === index) // unique
            .slice(0, 8);
    }, [allProducts, searchQuery]);

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
                description: 'Pilih minimal satu barang untuk dipinjam'
            });
            return;
        }

        if (!agreementAccepted) {
            toast.error('Persetujuan diperlukan', {
                description: 'Anda harus menyetujui syarat dan ketentuan peminjaman'
            });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const invalidItems = cartItems.filter(item => item.targetReturnDate <= today);
        if (invalidItems.length > 0) {
            toast.error('Tanggal pengembalian tidak valid', {
                description: 'Tanggal pengembalian harus setelah hari ini'
            });
            return;
        }

        setIsSubmitting(true);

        router.post('/peminjaman-barang', {
            items: JSON.stringify(cartItems.map(item => ({
                item_id: item.id,
                item_type: item.type,
                quantity: item.quantity,
                target_return_date: item.targetReturnDate,
                note: item.note || ''
            }))),
            agreement_accepted: agreementAccepted ? 1 : 0
        }, {
            onSuccess: () => {
                toast.success('Permintaan peminjaman berhasil dikirim', {
                    description: 'Menunggu persetujuan dari admin/aslab'
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
                            {filteredProducts.length === 0 ? (
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
                                    {/* Products */}
                                    <div className={cn(
                                        viewMode === 'grid'
                                            ? "grid gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                                            : "space-y-3"
                                    )}>
                                        {displayedData.map((product, index) => (
                                            <div
                                                key={`${product.type}-${product.id}`}
                                                ref={index === displayedData.length - 1 ? lastElementRef : null}
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

                                    {/* Loading Skeletons */}
                                    {virtualLoading && (
                                        <div className={cn(
                                            viewMode === 'grid'
                                                ? "grid gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                                                : "space-y-3"
                                        )}>
                                            {Array.from({ length: 6 }).map((_, index) => (
                                                <ProductCardSkeleton
                                                    key={`skeleton-${index}`}
                                                    className={cn(
                                                        "h-full",
                                                        viewMode === 'list' ? 'flex-row w-full' : 'w-full'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Load More Info */}
                                    {!virtualLoading && hasMore && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">
                                                Menampilkan {displayedData.length} dari {filteredProducts.length} barang
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Scroll ke bawah untuk melihat lebih banyak
                                            </p>
                                        </div>
                                    )}

                                    {/* End of Results */}
                                    {!hasMore && displayedData.length > 0 && (
                                        <div className="text-center py-4 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                ✨ Semua {displayedData.length} barang telah ditampilkan
                                            </p>
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
                                                Status: <span className="text-yellow-600 dark:text-yellow-400 font-medium">Pending Approval</span>
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
                                                <p className="font-medium mb-2">Dengan meminjam barang ini, saya berjanji:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>Menjaga barang dengan baik selama masa peminjaman</li>
                                                    <li>Mengembalikan barang sesuai jadwal yang ditentukan</li>
                                                    <li>Mengganti rugi jika terjadi kerusakan atau kehilangan</li>
                                                    <li>Menggunakan barang hanya untuk keperluan akademik</li>
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
                                                Ajukan Peminjaman ({getTotalItems()})
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-2">
                                        Permintaan akan dikirim ke admin/aslab
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
