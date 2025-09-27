import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Beaker, Calendar, Hash, Archive, ShoppingCart, X } from 'lucide-react';
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

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddToCart: (product: Product) => void;
}

export function ProductDetailModal({ product, isOpen, onOpenChange, onAddToCart }: ProductDetailModalProps) {
    if (!product) return null;

    const name = product.nama_aset || product.nama || 'Unknown';
    const code = product.kode_aset || product.kode || 'N/A';
    const isOutOfStock = product.stok === 0;

    // Handle image URL - add /storage/ prefix if not present
    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return null;

        // If path already starts with http or /, use as is
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }

        // Otherwise, prepend /storage/
        return `/storage/${imagePath}`;
    };

    const imageUrl = getImageUrl(product.gambar);

    const handleAddToCart = () => {
        onAddToCart(product);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-left">
                        {product.type === 'aset' ? (
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Beaker className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                        Detail {product.type === 'aset' ? 'Aset' : 'Bahan'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Image Section */}
                    <div className="aspect-square sm:aspect-[16/9] max-h-80 bg-muted rounded-lg overflow-hidden relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : null}

                        {/* Fallback icon when no image */}
                        <div className={cn(
                            "absolute inset-0 flex items-center justify-center bg-muted",
                            imageUrl && "hidden"
                        )}>
                            {product.type === 'aset' ? (
                                <Package className="h-16 w-16 text-muted-foreground" />
                            ) : (
                                <Beaker className="h-16 w-16 text-muted-foreground" />
                            )}
                        </div>

                        {/* Type Badge */}
                        <Badge
                            variant="secondary"
                            className={cn(
                                "absolute top-3 right-3",
                                product.type === 'aset'
                                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                                    : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                            )}
                        >
                            {product.type === 'aset' ? 'Aset' : 'Bahan'}
                        </Badge>

                        {/* Stock Status Overlay */}
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
                                <Badge variant="destructive" className="text-sm px-3 py-1">
                                    Stok Habis
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">{name}</h2>
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Kode: {code}</span>
                            </div>
                        </div>

                        <div className="border-t border-border my-4" />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Archive className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Stok Tersedia</span>
                                </div>
                                <div className="ml-6">
                                    <span className={cn(
                                        "text-2xl font-semibold",
                                        isOutOfStock ? "text-destructive" : "text-green-600 dark:text-green-400"
                                    )}>
                                        {product.stok}
                                    </span>
                                    <span className="text-muted-foreground ml-1">unit</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Status</span>
                                </div>
                                <div className="ml-6">
                                    <Badge variant={isOutOfStock ? "destructive" : "secondary"} className={cn(
                                        "text-sm",
                                        !isOutOfStock && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                                    )}>
                                        {isOutOfStock ? 'Tidak Tersedia' : 'Tersedia'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border my-4" />

                        {/* Additional Info */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-medium text-foreground mb-2">Informasi Tambahan</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Barang ini dapat dipinjam sesuai kebutuhan akademik</li>
                                <li>• Wajib mengembalikan dalam kondisi baik</li>
                                <li>• Peminjaman memerlukan persetujuan admin/aslab</li>
                                {product.type === 'aset' && (
                                    <li>• Asset ini merupakan inventaris laboratorium</li>
                                )}
                                {product.type === 'bahan' && (
                                    <li>• Bahan habis pakai, harap gunakan seperlunya</li>
                                )}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="flex-1"
                                size="lg"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                size="lg"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
