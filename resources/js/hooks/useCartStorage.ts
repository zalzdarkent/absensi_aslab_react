import { useState, useEffect, useCallback } from 'react';

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

const CART_STORAGE_KEY = 'peminjaman_cart';

export function useCartStorage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const parsedCart = JSON.parse(stored);
                // Validate that stored data is still valid
                if (Array.isArray(parsedCart)) {
                    setCartItems(parsedCart);
                }
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
            // If there's an error, clear the storage
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, []);

    // Save cart to localStorage whenever cartItems changes
    useEffect(() => {
        try {
            if (cartItems.length > 0) {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } else {
                // Remove from localStorage when cart is empty
                localStorage.removeItem(CART_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    }, [cartItems]);

    const addToCart = useCallback((item: CartItem) => {
        setCartItems(prev => [...prev, item]);
    }, []);

    const updateQuantity = useCallback((id: number, type: 'aset' | 'bahan', quantity: number) => {
        setCartItems(prev => prev.map(item =>
            item.id === id && item.type === type
                ? { ...item, quantity }
                : item
        ));
    }, []);

    const updateReturnDate = useCallback((id: number, type: 'aset' | 'bahan', date: string) => {
        setCartItems(prev => prev.map(item =>
            item.id === id && item.type === type
                ? { ...item, targetReturnDate: date }
                : item
        ));
    }, []);

    const updateNote = useCallback((id: number, type: 'aset' | 'bahan', note: string) => {
        setCartItems(prev => prev.map(item =>
            item.id === id && item.type === type
                ? { ...item, note }
                : item
        ));
    }, []);

    const updateManualBorrower = useCallback((id: number, type: 'aset' | 'bahan', field: 'name' | 'phone' | 'class', value: string) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id && item.type === type) {
                return {
                    ...item,
                    [`manualBorrower${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
                };
            }
            return item;
        }));
    }, []);

    const removeFromCart = useCallback((id: number, type: 'aset' | 'bahan') => {
        setCartItems(prev => prev.filter(item =>
            !(item.id === id && item.type === type)
        ));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const findCartItem = useCallback((id: number, type: 'aset' | 'bahan') => {
        return cartItems.find(item => item.id === id && item.type === type);
    }, [cartItems]);

    const getTotalItems = useCallback(() => {
        return cartItems.length;
    }, [cartItems]);

    const getTotalQuantity = useCallback(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    return {
        cartItems,
        addToCart,
        updateQuantity,
        updateReturnDate,
        updateNote,
        updateManualBorrower,
        removeFromCart,
        clearCart,
        findCartItem,
        getTotalItems,
        getTotalQuantity,
    };
}
