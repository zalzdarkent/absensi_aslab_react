import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AutoCompleteProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    suggestions: string[];
    onSuggestionSelect: (suggestion: string) => void;
    className?: string;
    loading?: boolean;
}

export function AutoComplete({
    value,
    onValueChange,
    placeholder = "Cari barang...",
    suggestions,
    onSuggestionSelect,
    className,
    loading = false
}: AutoCompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (value.length > 0 && suggestions.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
        setHighlightedIndex(-1);
    }, [suggestions, value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSuggestionClick(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onSuggestionSelect(suggestion);
        onValueChange(suggestion);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        onValueChange('');
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onValueChange(newValue);

        if (newValue.length === 0) {
            setShowSuggestions(false);
        }
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 font-medium">
                    {part}
                </span>
            ) : part
        );
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (value.length > 0 && suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    className="pl-10 pr-10"
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <Card
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 shadow-lg border border-border bg-card"
                >
                    <CardContent className="p-0">
                        <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={cn(
                                        "p-3 cursor-pointer border-b last:border-b-0 transition-colors border-border",
                                        index === highlightedIndex
                                            ? "bg-muted/50"
                                            : "hover:bg-muted/30"
                                    )}
                                >
                                    <div className="text-sm text-foreground">
                                        {highlightMatch(suggestion, value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
