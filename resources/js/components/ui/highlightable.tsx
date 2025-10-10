import { useEffect, useState } from 'react';

interface HighlightableRowProps {
    id: number | string;
    children: React.ReactNode;
    className?: string;
}

export function HighlightableRow({ id, children, className = "" }: HighlightableRowProps) {
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        // Get highlight ID from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get('highlight');

        if (highlightId && highlightId === id.toString()) {
            setIsHighlighted(true);

            // Scroll to the highlighted item
            const element = document.getElementById(`row-${id}`);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }

            // Remove highlight after 5 seconds
            const timer = setTimeout(() => {
                setIsHighlighted(false);
                // Remove highlight param from URL
                urlParams.delete('highlight');
                const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
                window.history.replaceState({}, '', newUrl);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [id]);

    return (
        <div
            id={`row-${id}`}
            className={`
                transition-all duration-500 ease-in-out
                ${isHighlighted
                    ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg scale-[1.02] ring-2 ring-yellow-300 ring-opacity-50'
                    : 'border-2 border-transparent'
                }
                ${className}
            `}
        >
            {children}
        </div>
    );
}

// Hook untuk mengecek apakah item sedang di-highlight
export function useHighlight(id: number | string) {
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get('highlight');

        if (highlightId && highlightId === id.toString()) {
            setIsHighlighted(true);

            // Auto-remove highlight after 5 seconds
            const timer = setTimeout(() => {
                setIsHighlighted(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [id]);

    return isHighlighted;
}

// Enhanced Table Row dengan highlight support
interface HighlightableTableRowProps {
    id: number | string;
    children: React.ReactNode;
    isApprovalPending?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
}

export function HighlightableTableRow({
    id,
    children,
    isApprovalPending = false,
    onApprove,
    onReject
}: HighlightableTableRowProps) {
    const isHighlighted = useHighlight(id);

    return (
        <tr
            id={`row-${id}`}
            className={`
                transition-all duration-500 ease-in-out
                ${isHighlighted
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-l-yellow-400 shadow-md'
                    : ''
                }
                ${isApprovalPending ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}
            `}
        >
            {children}

            {/* Quick Action Buttons untuk highlighted item */}
            {isHighlighted && isApprovalPending && (onApprove || onReject) && (
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        {onApprove && (
                            <button
                                onClick={onApprove}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors pulse-soft"
                            >
                                ✓ Setujui
                            </button>
                        )}
                        {onReject && (
                            <button
                                onClick={onReject}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors pulse-soft"
                            >
                                ✗ Tolak
                            </button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}

// Enhanced Card dengan highlight support
interface HighlightableCardProps {
    id: number | string;
    children: React.ReactNode;
    className?: string;
    isActionable?: boolean;
    onAction?: () => void;
    actionLabel?: string;
}

export function HighlightableCard({
    id,
    children,
    className = "",
    isActionable = false,
    onAction,
    actionLabel = "Tindakan"
}: HighlightableCardProps) {
    const isHighlighted = useHighlight(id);

    useEffect(() => {
        if (isHighlighted) {
            const element = document.getElementById(`card-${id}`);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [isHighlighted, id]);

    return (
        <div
            id={`card-${id}`}
            className={`
                transition-all duration-500 ease-in-out relative
                ${isHighlighted
                    ? 'ring-2 ring-yellow-400 ring-offset-2 shadow-xl scale-[1.02] bg-gradient-to-br from-yellow-50 to-amber-50'
                    : ''
                }
                ${className}
            `}
        >
            {children}

            {/* Quick Action Button */}
            {isHighlighted && isActionable && onAction && (
                <div className="absolute top-2 right-2">
                    <button
                        onClick={onAction}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors shadow-md pulse-soft"
                    >
                        {actionLabel}
                    </button>
                </div>
            )}
        </div>
    );
}

interface HighlightableProps {
    id: string;
    isHighlighted: boolean;
    children: React.ReactNode;
    className?: string;
}

export function Highlightable({ id, isHighlighted, children, className = "" }: HighlightableProps) {
    return (
        <div
            id={id}
            className={`
                transition-all duration-500 ease-in-out
                ${isHighlighted
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-400 shadow-lg scale-[1.01] ring-2 ring-yellow-300 ring-opacity-50'
                    : 'border-2 border-transparent'
                }
                ${className}
            `}
        >
            {children}
        </div>
    );
}
