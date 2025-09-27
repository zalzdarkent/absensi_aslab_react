import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Package, Beaker, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface ShoppingCartProps {
    items: CartItem[];
    onUpdateQuantity: (id: number, type: 'aset' | 'bahan', quantity: number) => void;
    onUpdateReturnDate: (id: number, type: 'aset' | 'bahan', date: string) => void;
    onUpdateNote: (id: number, type: 'aset' | 'bahan', note: string) => void;
    onRemoveItem: (id: number, type: 'aset' | 'bahan') => void;
    className?: string;
}

export function ShoppingCart({
    items,
    onUpdateQuantity,
    onUpdateReturnDate,
    onUpdateNote,
    onRemoveItem,
    className
}: ShoppingCartProps) {
    if (items.length === 0) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Keranjang Peminjaman
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Keranjang kosong</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Cari dan pilih barang yang ingin dipinjam
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCartIcon className="h-5 w-5" />
                    Keranjang Peminjaman ({items.length} item)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-grow">
                                <div className="flex-shrink-0">
                                    {item.type === 'aset' ? (
                                        <Package className="h-5 w-5 text-blue-600" />
                                    ) : (
                                        <Beaker className="h-5 w-5 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>({item.code})</span>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            item.type === 'aset'
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                        )}>
                                            {item.type === 'aset' ? 'Aset' : 'Bahan'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveItem(item.id, item.type)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor={`quantity-${item.type}-${item.id}`}>
                                    Jumlah
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id={`quantity-${item.type}-${item.id}`}
                                        type="number"
                                        min="1"
                                        max={item.maxStock}
                                        value={item.quantity}
                                        onChange={(e) => onUpdateQuantity(
                                            item.id,
                                            item.type,
                                            Math.min(parseInt(e.target.value) || 1, item.maxStock)
                                        )}
                                        className="w-20"
                                    />
                                    <span className="text-sm text-gray-500">
                                        {item.unit} (max: {item.maxStock})
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`return-date-${item.type}-${item.id}`}>
                                    Target Kembali
                                </Label>
                                <Input
                                    id={`return-date-${item.type}-${item.id}`}
                                    type="date"
                                    value={item.targetReturnDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => onUpdateReturnDate(item.id, item.type, e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`note-${item.type}-${item.id}`}>
                                    Catatan
                                </Label>
                                <Input
                                    id={`note-${item.type}-${item.id}`}
                                    type="text"
                                    placeholder="Keperluan..."
                                    value={item.note || ''}
                                    onChange={(e) => onUpdateNote(item.id, item.type, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
