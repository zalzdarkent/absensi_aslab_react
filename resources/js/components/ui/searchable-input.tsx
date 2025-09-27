import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Item {
    id: number;
    name: string;
    code: string;
    stock: number;
    unit: string;
    type: 'aset' | 'bahan';
    display_name: string;
    stock_info: string;
}

interface SearchableInputProps {
    onItemSelect: (item: Item) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableInput({ onItemSelect, placeholder = "Cari barang atau bahan...", className }: SearchableInputProps) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (query.length >= 2) {
                searchItems(query);
            } else {
                setItems([]);
                setShowSuggestions(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(delayedSearch);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchItems = async (searchQuery: string) => {
        console.log('Searching for:', searchQuery);
        setLoading(true);
        try {
            const url = `/peminjaman-barang/search-items?q=${encodeURIComponent(searchQuery)}`;
            console.log('Request URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Include cookies for Laravel session
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                setItems(data.items || []);
                setShowSuggestions(true);
            } else {
                console.error('Search failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setItems([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };    const handleItemClick = (item: Item) => {
        onItemSelect(item);
        setQuery('');
        setItems([]);
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            setQuery('');
        }
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && items.length > 0 && setShowSuggestions(true)}
                    className="pl-10"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {showSuggestions && items.length > 0 && (
                <Card
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 shadow-lg border bg-white"
                >
                    <CardContent className="p-0">
                        <div className="max-h-60 overflow-y-auto">
                            {items.map((item) => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleItemClick(item)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {item.type === 'aset' ? (
                                                <Package className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Beaker className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.display_name}
                                                </p>
                                                <span className={cn(
                                                    "px-2 py-1 text-xs rounded-full font-medium",
                                                    item.type === 'aset'
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-green-100 text-green-700"
                                                )}>
                                                    {item.type === 'aset' ? 'Aset' : 'Bahan'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.stock_info}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {showSuggestions && query.length >= 2 && items.length === 0 && !loading && (
                <Card className="absolute z-50 w-full mt-1 shadow-lg border bg-white">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500 text-center">
                            Tidak ada barang ditemukan untuk "{query}"
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
