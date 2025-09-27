import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Beaker, ShoppingCart, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onViewDetail: (product: Product) => void;
    className?: string;
}

export function ProductCard({ product, onAddToCart, onViewDetail, className }: ProductCardProps) {
    const name = product.nama_aset || product.nama || 'Unknown';
    const code = product.kode_aset || product.kode || 'N/A';
    const isOutOfStock = product.stok === 0;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

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

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    // Detect if parent requested list layout by checking for 'flex-row' in the passed className
    const isListMode = typeof className === 'string' && className.includes('flex-row');

    return (
        <Card ref={cardRef} className={cn(
            "group hover:shadow-lg transition-all duration-200 border-border bg-card text-card-foreground",
            isListMode ? "flex flex-row items-stretch" : "flex flex-col",
            className
        )}>
            {/* Image Container */}
            <div className={cn(
                "relative bg-muted rounded-lg overflow-hidden flex-shrink-0",
                isListMode
                    ? "w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 m-3 mr-0"
                    : "aspect-square mx-4 mt-4 mb-3"
            )}>
                {!isVisible ? (
                    // Skeleton while not visible
                    <Skeleton className="w-full h-full" />
                ) : imageUrl && !imageError ? (
                    <>
                        {!imageLoaded && <Skeleton className="w-full h-full absolute inset-0" />}
                        <img
                            src={imageUrl}
                            alt={name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className={cn(
                                "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200",
                                !imageLoaded && "opacity-0"
                            )}
                            loading="lazy"
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        {product.type === 'aset' ? (
                            <Package className={cn(
                                "text-muted-foreground",
                                isListMode ? "h-6 w-6 xs:h-8 xs:w-8" : "h-12 w-12"
                            )} />
                        ) : (
                            <Beaker className={cn(
                                "text-muted-foreground",
                                isListMode ? "h-6 w-6 xs:h-8 xs:w-8" : "h-12 w-12"
                            )} />
                        )}
                    </div>
                )}

                {/* Type Badge */}
                <Badge
                    variant="secondary"
                    className={cn(
                        "absolute top-2 right-2 text-xs px-2 py-1",
                        isListMode && "top-1 right-1 text-[10px] px-1 py-0",
                        product.type === 'aset'
                            ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                            : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                    )}
                >
                    {product.type === 'aset' ? 'Aset' : 'Bahan'}
                </Badge>

                {/* Stock Status */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
                        <Badge variant="destructive" className={cn(
                            isListMode ? "text-[10px] px-1.5 py-0.5" : "text-xs"
                        )}>
                            Stok Habis
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className={cn(
                "flex flex-col flex-1 min-w-0",
                isListMode ? "p-3 pl-2 justify-between" : "px-4 pb-4"
            )}>
                {/* Product Info */}
                <div className={cn(
                    "space-y-2 flex-1",
                    isListMode ? "mb-2 space-y-1" : "mb-4"
                )}>
                    <h3 className={cn(
                        "font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors",
                        isListMode ? "text-sm leading-tight" : "text-lg leading-tight"
                    )}>
                        {name}
                    </h3>
                    <p className={cn(
                        "text-muted-foreground",
                        isListMode ? "text-xs" : "text-sm"
                    )}>
                        Kode: {code}
                    </p>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between">
                        <span className={cn(
                            "text-muted-foreground",
                            isListMode ? "text-xs" : "text-sm"
                        )}>
                            Stok:
                        </span>
                        <span className={cn(
                            "font-semibold",
                            isListMode ? "text-xs" : "text-sm",
                            isOutOfStock ? "text-destructive" : "text-green-600 dark:text-green-400"
                        )}>
                            {product.stok} unit
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={cn(
                    "flex mt-auto w-full",
                    isListMode
                        ? "flex-col xs:flex-row gap-1.5"
                        : "flex-col gap-2"
                )}>
                    <Button
                        variant="outline"
                        size={isListMode ? "sm" : "default"}
                        onClick={() => onViewDetail(product)}
                        className={cn(
                            "w-full justify-center",
                            isListMode ? "h-7 text-xs px-2" : "h-9 text-sm px-3"
                        )}
                    >
                        <Eye className={cn(
                            isListMode ? "h-3 w-3" : "h-4 w-4",
                            "flex-shrink-0 mr-1.5"
                        )} />
                        <span className="whitespace-nowrap">Detail</span>
                    </Button>
                    <Button
                        size={isListMode ? "sm" : "default"}
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={cn(
                            "w-full justify-center font-medium",
                            isListMode ? "h-7 text-xs px-2" : "h-9 text-sm px-3"
                        )}
                    >
                        <ShoppingCart className={cn(
                            isListMode ? "h-3 w-3" : "h-4 w-4",
                            "flex-shrink-0 mr-1.5"
                        )} />
                        <span className="whitespace-nowrap">
                            {isOutOfStock ? 'Habis' : 'Tambah'}
                        </span>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
