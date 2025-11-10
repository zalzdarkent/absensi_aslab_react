import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UserOption {
    id: number;
    name: string;
    prodi: string;
    semester: number;
}

interface UserComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    users: UserOption[];
    className?: string;
    disabled?: boolean;
}

export function UserCombobox({
    value,
    onValueChange,
    placeholder = "Pilih aslab...",
    users,
    className,
    disabled = false
}: UserComboboxProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Get selected user data
    const selectedUser = users.find(user => user.id.toString() === value);

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prodi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.semester.toString().includes(searchQuery)
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
                // Reset search query when clicking outside
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredUsers]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || filteredUsers.length === 0) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSuggestions(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredUsers.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredUsers.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleUserSelect(filteredUsers[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSearchQuery('');
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleUserSelect = (user: UserOption) => {
        onValueChange(user.id.toString());
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

    const displayValue = showSuggestions
        ? searchQuery
        : selectedUser
            ? selectedUser.name
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
            ) : part
        );
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {showSuggestions ? (
                        <Search className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={selectedUser ? selectedUser.name : placeholder}
                    value={displayValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    disabled={disabled}
                    className={cn(
                        "pl-10 pr-16 cursor-pointer",
                        !showSuggestions && selectedUser && "text-foreground"
                    )}
                    readOnly={!showSuggestions}
                />

                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {selectedUser && (
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
                                "h-4 w-4 transition-transform",
                                showSuggestions && "rotate-180"
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
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserSelect(user)}
                                        className={cn(
                                            "p-3 cursor-pointer border-b last:border-b-0 transition-colors border-border",
                                            index === highlightedIndex
                                                ? "bg-muted/50"
                                                : "hover:bg-muted/30",
                                            value === user.id.toString() && "bg-accent/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div className="flex-grow min-w-0">
                                                <div className="text-sm font-medium text-foreground">
                                                    {highlightMatch(user.name, searchQuery)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {highlightMatch(user.prodi, searchQuery)} - Semester {user.semester}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    {searchQuery ? (
                                        <>Tidak ada aslab ditemukan untuk "{searchQuery}"</>
                                    ) : (
                                        <>Tidak ada data aslab</>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
