/**
 * Shopify Checkout Utilities
 * Helper functions for working with Shopify checkout
 */

/**
 * Get the first variant ID from a Shopify product ID
 * @param productId - Shopify product GID (e.g., "gid://shopify/Product/123456")
 * @returns Variant GID (e.g., "gid://shopify/ProductVariant/789012")
 */
export function getFirstVariantId(productId: string): string {
    // If it's already a variant ID, return it
    if (productId.includes('ProductVariant')) {
        return productId;
    }

    // Extract the product ID number
    const match = productId.match(/Product\/(\d+)/);
    if (!match) {
        throw new Error('Invalid product ID format');
    }

    // For now, we'll return the product ID as-is and let Shopify handle it
    // In production, you should fetch the actual variant ID from the product
    return productId.replace('/Product/', '/ProductVariant/');
}

/**
 * Format price for display
 * @param amount - Price amount as string
 * @param currencyCode - Currency code (e.g., "AED")
 * @returns Formatted price string
 */
export function formatPrice(amount: string | number, currencyCode: string = 'AED'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currencyCode} ${numAmount.toFixed(2)}`;
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d+\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Extract order ID from Shopify checkout URL
 * @param url - Shopify order confirmation URL
 * @returns Order ID or null
 */
export function extractOrderIdFromUrl(url: string): string | null {
    const match = url.match(/orders\/(\d+)/);
    return match ? match[1] : null;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return import.meta.env.env.NODE_ENV === 'development';
}

/**
 * Get return URL for Shopify checkout
 */
export function getCheckoutReturnUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/booking-confirmation`;
}