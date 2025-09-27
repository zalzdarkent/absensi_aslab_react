import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Plus, Minus, Trash2, Package, Beaker, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export interface CartItem {
    id: number;
    name: string;
    code: string;
    type: 'aset' | 'bahan';
    unit: string;
    maxStock: number;
    quantity: number;
    targetReturnDate: string;
    note?: string;
}

interface CartDrawerProps {
    items: CartItem[];
    onUpdateQuantity: (id: number, type: 'aset' | 'bahan', quantity: number) => void;
    onUpdateReturnDate: (id: number, type: 'aset' | 'bahan', date: string) => void;
    onUpdateNote: (id: number, type: 'aset' | 'bahan', note: string) => void;
    onRemoveItem: (id: number, type: 'aset' | 'bahan') => void;
    onClearCart: () => void;
}

export function CartDrawer({
    items,
    onUpdateQuantity,
    onUpdateReturnDate,
    onUpdateNote,
    onRemoveItem,
    onClearCart
}: CartDrawerProps) {
    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleClearCartAndClose = () => {
        console.log('Clearing cart... Current items:', items.length);

        onClearCart();

        // Force clear localStorage dengan small delay untuk memastikan state sudah update
        setTimeout(() => {
            try {
                localStorage.removeItem('peminjaman_cart');
                console.log('localStorage cleared explicitly');
                console.log('localStorage after clear:', localStorage.getItem('peminjaman_cart'));
            } catch (error) {
                console.error('Error clearing localStorage:', error);
            }
        }, 100);

        setAgreementAccepted(false);
        setIsSheetOpen(false);
    };

    // Debug effect to monitor items changes
    useEffect(() => {
        console.log('Cart items changed:', items.length);
    }, [items]);

    const handleSubmitRequest = async () => {
        if (items.length === 0) {
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
        const invalidItems = items.filter(item => item.targetReturnDate <= today);
        if (invalidItems.length > 0) {
            toast.error('Tanggal pengembalian tidak valid', {
                description: 'Tanggal pengembalian harus setelah hari ini'
            });
            return;
        }

        setIsSubmitting(true);

        router.post('/peminjaman-barang', {
            items: JSON.stringify(items.map(item => ({
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

                // Clear cart using the same approach as create.tsx
                console.log('Success callback - clearing cart...');
                onClearCart();

                // Also force clear localStorage as double-check
                setTimeout(() => {
                    try {
                        localStorage.removeItem('peminjaman_cart');
                        console.log('Force cleared localStorage in success callback');
                    } catch (error) {
                        console.error('Error force clearing localStorage:', error);
                    }
                }, 200);

                setAgreementAccepted(false);
                setIsSheetOpen(false);
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

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Keranjang
                    {items.length > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                            variant="destructive"
                        >
                            {items.length}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col overflow-hidden">
                <SheetHeader className="px-1">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang Peminjaman
                    </SheetTitle>
                    <SheetDescription>
                        {items.length === 0
                            ? "Keranjang Anda kosong"
                            : `${items.length} item, total ${totalItems} unit`
                        }
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex-1 px-1 pb-6 overflow-hidden flex flex-col">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Keranjang kosong</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">
                                Pilih barang yang ingin dipinjam
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
                                {items.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="border border-border rounded-lg p-4 bg-card">
                                        {/* Item Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0">
                                                    {item.type === 'aset' ? (
                                                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <Beaker className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-foreground line-clamp-1">{item.name}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span className="truncate">({item.code})</span>
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "text-xs flex-shrink-0",
                                                                item.type === 'aset'
                                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                            )}
                                                        >
                                                            {item.type === 'aset' ? 'Aset' : 'Bahan'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRemoveItem(item.id, item.type)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium">Jumlah:</Label>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onUpdateQuantity(
                                                            item.id,
                                                            item.type,
                                                            Math.max(1, item.quantity - 1)
                                                        )}
                                                        disabled={item.quantity <= 1}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="min-w-[2rem] text-center font-medium text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onUpdateQuantity(
                                                            item.id,
                                                            item.type,
                                                            Math.min(item.maxStock, item.quantity + 1)
                                                        )}
                                                        disabled={item.quantity >= item.maxStock}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground text-right">
                                                Max: {item.maxStock} unit
                                            </div>

                                            {/* Return Date */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Target Kembali:</Label>
                                                <Input
                                                    type="date"
                                                    value={item.targetReturnDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => onUpdateReturnDate(item.id, item.type, e.target.value)}
                                                    className="text-sm h-9"
                                                />
                                            </div>

                                            {/* Note */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Catatan:</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Keperluan..."
                                                    value={item.note || ''}
                                                    onChange={(e) => onUpdateNote(item.id, item.type, e.target.value)}
                                                    className="text-sm h-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Footer */}
                            <div className="border-t border-border pt-6 pb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
                                <div className="space-y-4 px-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Item:</span>
                                        <span className="font-semibold text-foreground">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Kuantitas:</span>
                                        <span className="font-semibold text-foreground">{totalItems} unit</span>
                                    </div>

                                    {/* Agreement Section */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                                <p className="font-medium mb-2">Syarat & Ketentuan:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>Menjaga barang dengan baik</li>
                                                    <li>Mengembalikan sesuai jadwal</li>
                                                    <li>Mengganti rugi jika rusak/hilang</li>
                                                    <li>Untuk keperluan akademik</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4">
                                            <Checkbox
                                                id="cart-agreement"
                                                checked={agreementAccepted}
                                                onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                                            />
                                            <label
                                                htmlFor="cart-agreement"
                                                className="text-xs font-medium text-yellow-800 dark:text-yellow-200 cursor-pointer"
                                            >
                                                Saya menyetujui syarat dan ketentuan *
                                            </label>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleSubmitRequest}
                                            disabled={!agreementAccepted || items.length === 0 || isSubmitting}
                                            className="w-full h-11"
                                            size="default"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Ajukan Peminjaman ({items.length})
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="default"
                                            onClick={handleClearCartAndClose}
                                            className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Kosongkan Keranjang
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
