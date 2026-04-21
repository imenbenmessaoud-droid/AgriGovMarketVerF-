import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('agrisouk_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('agrisouk_cart', JSON.stringify(cart));
    }, [cart]);

    const toggleCart = (open) => {
        setIsCartOpen(open !== undefined ? open : !isCartOpen);
    };

    const addToCart = (product, quantity, unit = 'kg') => {
        // product is a ProductItem from the API
        // use id_order_item as the unique cart key
        const itemId = product.id_order_item || product.id;
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._cartId === itemId && item.unit === unit);
            if (existingItem) {
                return prevCart.map(item =>
                    (item._cartId === itemId && item.unit === unit)
                        ? { ...item, quantity: item.quantity + (quantity || 1) }
                        : item
                );
            }
            return [...prevCart, { ...product, _cartId: itemId, quantity: quantity || 1, unit }];
        });
    };

    const removeFromCart = (cartId) => {
        setCart(prevCart => prevCart.filter(item => item._cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        if (quantity <= 0) return;
        setCart(prevCart =>
            prevCart.map(item =>
                item._cartId === cartId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    // use product_price (API field) with fallback to price (old mock)
    const cartSubtotal = cart.reduce(
        (total, item) => {
            const multiplier = item.unit === 'ton' ? 1000 : 1;
            const price = item.product_price || item.price || 0;
            return total + (price * item.quantity * multiplier);
        }, 0
    );

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartSubtotal,
            isCartOpen,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
