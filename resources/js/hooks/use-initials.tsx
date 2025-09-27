import { useCallback } from 'react';

export function useInitials() {
    return useCallback((fullName: string): string => {
        // Handle undefined, null, or empty string cases
        if (!fullName || typeof fullName !== 'string') {
            return 'U'; // Default initials for "Unknown"
        }

        const names = fullName.trim().split(' ');

        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        const firstInitial = names[0].charAt(0);
        const lastInitial = names[names.length - 1].charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }, []);
}
