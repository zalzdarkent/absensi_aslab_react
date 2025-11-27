import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingCart, Plus, Minus, Trash2, Package, Beaker, Send, AlertTriangle, User, HelpCircle } from 'lucide-react';
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
    manualBorrowerName?: string;
    manualBorrowerPhone?: string;
    manualBorrowerClass?: string;
}

interface CartDrawerProps {
    items: CartItem[];
    onUpdateQuantity: (id: number, type: 'aset' | 'bahan', quantity: number) => void;
    onUpdateReturnDate: (id: number, type: 'aset' | 'bahan', date: string) => void;
    onUpdateNote: (id: number, type: 'aset' | 'bahan', note: string) => void;
    onUpdateManualBorrower: (id: number, type: 'aset' | 'bahan', field: 'name' | 'phone' | 'class', value: string) => void;
    onRemoveItem: (id: number, type: 'aset' | 'bahan') => void;
    onClearCart: () => void;
    isAnimating?: boolean;
}

export function CartDrawer({
    items,
    onUpdateQuantity,
    onUpdateReturnDate,
    onUpdateNote,
    onUpdateManualBorrower,
    onRemoveItem,
    onClearCart,
    isAnimating = false
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
        console.log('Debug validation:', {
            today,
            items: items.map(item => ({
                name: item.name,
                targetReturnDate: item.targetReturnDate,
                isValid: item.targetReturnDate && item.targetReturnDate >= today
            }))
        });

        const invalidItems = items.filter(item => !item.targetReturnDate || item.targetReturnDate < today);
        if (invalidItems.length > 0) {
            console.error('Invalid items found:', invalidItems);
            toast.error('Tanggal pengembalian wajib diisi', {
                description: 'Tanggal pengembalian harus diisi dan tidak boleh lebih awal dari hari ini'
            });
            return;
        }

        setIsSubmitting(true);

        const requestData = {
            items: JSON.stringify(items.map(item => ({
                item_id: item.id,
                item_type: item.type,
                quantity: item.quantity,
                target_return_date: item.targetReturnDate,
                note: item.note || '',
                manual_borrower_name: item.manualBorrowerName || null,
                manual_borrower_phone: item.manualBorrowerPhone || null,
                manual_borrower_class: item.manualBorrowerClass || null
            }))),
            agreement_accepted: agreementAccepted ? 1 : 0
        };

        console.log('Sending request:', requestData);
        console.log('Parsed items:', JSON.parse(requestData.items));

        router.post('/peminjaman-barang', requestData, {
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
            onError: (errors) => {
                console.error('Request failed:', errors);
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
                <Button
                    className={cn(
                        "relative h-16 w-16 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl bg-primary hover:bg-primary/90 border-2 border-background",
                        isAnimating && "animate-bounce"
                    )}
                    size="lg"
                >
                    <div className="relative flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-primary-foreground" />
                        {items.length > 0 && (
                            <span className={cn(
                                "absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-bold transition-all duration-300 shadow-lg border-2 border-background",
                                isAnimating && "animate-pulse scale-125"
                            )}>
                                {items.length > 99 ? '99+' : items.length}
                            </span>
                        )}
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] lg:w-[540px] flex flex-col overflow-hidden">
                <SheetHeader className="px-1">
                    <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        Keranjang Peminjaman
                    </SheetTitle>
                    <SheetDescription className="text-sm">
                        {items.length === 0
                            ? "Keranjang Anda kosong"
                            : `${items.length} item, total ${totalItems} unit`
                        }
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex-1 px-1 pb-4 sm:pb-6 overflow-hidden flex flex-col">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-muted-foreground">Keranjang kosong</p>
                            <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">
                                Pilih barang yang ingin dipinjam
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 pb-3 sm:pb-4">
                                {items.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="border border-border rounded-lg p-3 sm:p-4 bg-card">
                                        {/* Item Header */}
                                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0">
                                                    {item.type === 'aset' ? (
                                                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <Beaker className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-sm sm:text-base text-foreground line-clamp-1">{item.name}</h4>
                                                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                                        <span className="truncate">({item.code})</span>
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "text-xs flex-shrink-0 px-1 sm:px-2 py-0.5",
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
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 ml-1 sm:ml-2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs sm:text-sm font-medium">Jumlah:</Label>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onUpdateQuantity(
                                                            item.id,
                                                            item.type,
                                                            Math.max(1, item.quantity - 1)
                                                        )}
                                                        disabled={item.quantity <= 1}
                                                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                                    >
                                                        <Minus className="h-2 w-2 sm:h-3 sm:w-3" />
                                                    </Button>
                                                    <span className="min-w-[1.5rem] sm:min-w-[2rem] text-center font-medium text-xs sm:text-sm">
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
                                                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                                    >
                                                        <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground text-right">
                                                Max: {item.maxStock} unit
                                            </div>

                                            {/* Return Date */}
                                            <div className="space-y-1 sm:space-y-2">
                                                <Label className="text-xs sm:text-sm font-medium">
                                                    Target Kembali: <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={item.targetReturnDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => onUpdateReturnDate(item.id, item.type, e.target.value)}
                                                    className="text-xs sm:text-sm h-8 sm:h-9"
                                                    required
                                                />
                                            </div>


                                            {/* Manual Borrower Data */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                                                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                                                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                    <Label className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                                        Peminjaman Manual (Opsional)
                                                    </Label>
                                                </div>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Nama peminjam..."
                                                        value={item.manualBorrowerName || ''}
                                                        onChange={(e) => onUpdateManualBorrower(item.id, item.type, 'name', e.target.value)}
                                                        className="text-xs h-7 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            type="text"
                                                            placeholder="No. telepon..."
                                                            value={item.manualBorrowerPhone || ''}
                                                            onChange={(e) => onUpdateManualBorrower(item.id, item.type, 'phone', e.target.value)}
                                                            className="text-xs h-7 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder="Kelas"
                                                            value={item.manualBorrowerClass || ''}
                                                            onChange={(e) => onUpdateManualBorrower(item.id, item.type, 'class', e.target.value)}
                                                            className="text-xs h-7 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 italic">
                                                    Untuk peminjaman orang lain yang datang langsung
                                                </p>
                                            </div>

                                            {/* Note */}
                                            <div className="space-y-1 sm:space-y-2">
                                                <Label className="text-xs sm:text-sm font-medium">Catatan (Opsional):</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Keperluan..."
                                                    value={item.note || ''}
                                                    onChange={(e) => onUpdateNote(item.id, item.type, e.target.value)}
                                                    className="text-xs sm:text-sm h-8 sm:h-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Footer */}
                            <div className="border-t border-border pt-4 sm:pt-6 pb-3 sm:pb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
                                <div className="space-y-3 sm:space-y-4 px-1">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Total Item:</span>
                                        <span className="font-semibold text-foreground">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Total Kuantitas:</span>
                                        <span className="font-semibold text-foreground">{totalItems} unit</span>
                                    </div>

                                    {/* Agreement Section */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="cart-agreement"
                                            checked={agreementAccepted}
                                            onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="cart-agreement"
                                            className="text-xs sm:text-sm font-medium text-foreground cursor-pointer flex items-center gap-1"
                                        >
                                            Saya menyetujui syarat dan ketentuan *
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-xs">
                                                        <div className="space-y-1 text-xs">
                                                            <p className="font-semibold mb-2">Syarat & Ketentuan:</p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                <li>Menjaga barang dengan baik</li>
                                                                <li>Mengembalikan sesuai jadwal</li>
                                                                <li>Mengganti rugi jika rusak/hilang</li>
                                                                <li>Untuk keperluan akademik</li>
                                                            </ul>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <Button
                                            onClick={handleSubmitRequest}
                                            disabled={!agreementAccepted || items.length === 0 || isSubmitting}
                                            className="w-full h-10 sm:h-11 text-xs sm:text-sm"
                                            size="default"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    Ajukan Peminjaman ({items.length})
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="default"
                                            onClick={handleClearCartAndClose}
                                            className="w-full h-10 sm:h-11 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 font-medium"
                                        >
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
