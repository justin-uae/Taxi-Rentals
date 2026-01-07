import type { CartItem } from '../store/slices/cartSlice';

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

interface ShopifyCartLineInput {
    merchandiseId: string;
    quantity: number;
    attributes?: Array<{ key: string; value: string }>;
}

/**
 * Convert cart item to Shopify line input
 */
export const cartItemToLineInput = (cartItem: CartItem): ShopifyCartLineInput => {
    return {
        merchandiseId: cartItem.taxi.shopifyId || '', // This should be the variant ID
        quantity: cartItem.quantity || 1,
        attributes: [
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'distance', value: `${cartItem.search.distance || 0} km` },
            { key: 'duration', value: cartItem.search.duration || '' },
            { key: 'pickup_date', value: cartItem.search.date },
            { key: 'pickup_time', value: cartItem.search.time },
            { key: 'total_price', value: `AED ${cartItem.totalPrice}` },
        ],
    };
};

/**
 * SIMPLE GUEST CHECKOUT - Creates cart and returns checkout URL
 */
export const createCart = async (cartItem: CartItem, email?: string): Promise<string> => {
    const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

    const lineItem = cartItemToLineInput(cartItem);

    const cartInput: any = {
        lines: [lineItem],
        attributes: [
            { key: 'booking_type', value: 'taxi_booking' },
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'pickup_date', value: cartItem.search.date },
            { key: 'pickup_time', value: cartItem.search.time },
        ],
    };

    // Add buyer identity with email if provided
    if (email) {
        cartInput.buyerIdentity = {
            email: email,
            countryCode: 'AE', // United Arab Emirates
        };
    }

    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({
            query: mutation,
            variables: {
                input: cartInput,
            },
        }),
    });

    const result = await response.json();

    // Better error logging
    console.log('Cart creation response:', result);

    if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
    }

    if (result.data.cartCreate.userErrors.length > 0) {
        console.error('User errors:', result.data.cartCreate.userErrors);
        const errorMessage = result.data.cartCreate.userErrors
            .map((err: any) => err.message)
            .join(', ');
        throw new Error(errorMessage);
    }

    const checkoutUrl = result.data.cartCreate.cart.checkoutUrl;

    if (!checkoutUrl) {
        throw new Error('No checkout URL returned from Shopify');
    }

    return checkoutUrl;
};

/**
 * Optional: Update cart with customer email after creation
 */
export const updateCartBuyerIdentity = async (
    cartId: string,
    email: string
): Promise<void> => {
    const mutation = `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({
            query: mutation,
            variables: {
                cartId: cartId,
                buyerIdentity: {
                    email: email,
                    countryCode: 'AE',
                },
            },
        }),
    });

    const result = await response.json();

    if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
    }

    if (result.data.cartBuyerIdentityUpdate.userErrors.length > 0) {
        console.error('User errors:', result.data.cartBuyerIdentityUpdate.userErrors);
        throw new Error(result.data.cartBuyerIdentityUpdate.userErrors[0].message);
    }
};