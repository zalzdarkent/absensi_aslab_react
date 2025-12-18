import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, MapPin, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface LokasiComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    lokasiOptions?: LokasiOption[];
    className?: string;
    disabled?: boolean;
    onAddNew?: () => void;
}

export function LokasiCombobox({
    value,
    onValueChange,
    placeholder = 'Pilih lokasi...',
    lokasiOptions = [],
    className,
    disabled = false,
    onAddNew,
}: LokasiComboboxProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const safeOptions = lokasiOptions ?? [];

    const selectedLokasi = safeOptions.find((lokasi) => lokasi.id.toString() === value);

    const filteredLokasi = safeOptions.filter((lokasi) =>
        lokasi.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredLokasi]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || filteredLokasi.length === 0) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSuggestions(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredLokasi.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredLokasi.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleLokasiSelect(filteredLokasi[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSearchQuery('');
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleLokasiSelect = (lokasi: LokasiOption) => {
        onValueChange(lokasi.id.toString());
        setShowSuggestions(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        onValueChange('');
        setSearchQuery('');
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);

        if (!showSuggestions) {
            setShowSuggestions(true);
        }
    };

    const handleInputFocus = () => {
        setShowSuggestions(true);
    };

    const handleToggle = () => {
        if (disabled) return;
        setShowSuggestions(!showSuggestions);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleAddNew = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddNew) {
            onAddNew();
        }
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const displayValue = showSuggestions
        ? searchQuery
        : selectedLokasi
            ? selectedLokasi.nama_lokasi
            : '';

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-medium">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className={cn('relative', className)}>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {showSuggestions ? (
                        <Search className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={selectedLokasi ? selectedLokasi.nama_lokasi : placeholder}
                    value={displayValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    disabled={disabled}
                    className={cn(
                        'pl-10 pr-16 cursor-pointer',
                        !showSuggestions && selectedLokasi && 'text-foreground'
                    )}
                    readOnly={!showSuggestions}
                />

                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {selectedLokasi && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            disabled={disabled}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggle}
                        disabled={disabled}
                        className="h-8 w-8 p-0 hover:bg-muted"
                        type="button"
                    >
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                showSuggestions && 'rotate-180'
                            )}
                        />
                    </Button>
                </div>
            </div>

            {showSuggestions && (
                <Card
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 shadow-lg border border-border bg-card"
                >
                    <CardContent className="p-0">
                        <div className="max-h-60 overflow-y-auto">
                            {filteredLokasi.length > 0 ? (
                                filteredLokasi.map((lokasi, index) => (
                                    <div
                                        key={lokasi.id}
                                        onClick={() => handleLokasiSelect(lokasi)}
                                        className={cn(
                                            'p-3 cursor-pointer border-b last:border-b-0 transition-colors border-border',
                                            index === highlightedIndex
                                                ? 'bg-muted/50'
                                                : 'hover:bg-muted/30',
                                            value === lokasi.id.toString() && 'bg-accent/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <div className="flex-grow min-w-0">
                                                <div className="text-sm font-medium text-foreground">
                                                    {highlightMatch(lokasi.nama_lokasi, searchQuery)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    {searchQuery ? (
                                        <>
                                            Tidak ada lokasi ditemukan untuk "{searchQuery}"
                                            {onAddNew && (
                                                <div className="mt-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAddNew}
                                                        className="w-full"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Tambah Lokasi Baru
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Tidak ada data lokasi
                                            {onAddNew && (
                                                <div className="mt-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAddNew}
                                                        className="w-full"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Tambah Lokasi Baru
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {onAddNew && filteredLokasi.length > 0 && (
                                <div className="border-t border-border bg-muted/20">
                                    <div
                                        onClick={handleAddNew}
                                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Plus className="w-4 h-4 text-primary" />
                                            <div className="text-sm font-medium text-primary">
                                                Tambah Lokasi Baru
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


