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
 * 
 * PRICING STRATEGY:
 * - One-way trip: quantity = 1
 * - Return trip: quantity = 2 (represents 2 trips with same variant)
 * 
 * This allows dynamic pricing while using Shopify's native system
 */
export const cartItemToLineInput = (cartItem: CartItem): ShopifyCartLineInput => {
    const isReturn = cartItem.search.tripType === 'return';

    return {
        merchandiseId: cartItem.taxi.shopifyId || '', // Variant ID
        quantity: isReturn ? 2 : 1, // 2 for return trips!
        attributes: [
            { key: 'booking_type', value: 'Transport Booking' },
            { key: 'trip_type', value: isReturn ? 'Round Trip' : 'One-Way' },
            { key: 'vehicle', value: cartItem.taxi.name },
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'distance', value: `${cartItem.search.distance || 0} km${isReturn ? ' (each way)' : ''}` },
            { key: 'duration', value: cartItem.search.duration || '' },

            // Outbound details
            { key: 'outbound_date', value: cartItem.search.date },
            { key: 'outbound_time', value: cartItem.search.time },

            // Return details (if applicable)
            ...(isReturn && cartItem.search.returnDate ? [
                { key: 'return_date', value: cartItem.search.returnDate },
                { key: 'return_time', value: cartItem.search.returnTime || '' },
            ] : []),

            { key: 'total_fare', value: `AED ${cartItem.totalPrice}` },
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
            { key: 'trip_type', value: cartItem.search.tripType || 'one-way' },
            { key: 'vehicle_name', value: cartItem.taxi.name },
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'outbound_date', value: cartItem.search.date },
            { key: 'outbound_time', value: cartItem.search.time },
            ...(cartItem.search.tripType === 'return' && cartItem.search.returnDate ? [
                { key: 'return_date', value: cartItem.search.returnDate },
                { key: 'return_time', value: cartItem.search.returnTime || '' },
            ] : []),
            { key: 'distance_km', value: `${cartItem.search.distance || 0}` },
            { key: 'calculated_total', value: `${cartItem.totalPrice}` },
        ],
        note: cartItem.search.tripType === 'return'
            ? `Round Trip Transport Booking: ${cartItem.taxi.name}
From: ${cartItem.search.from}
To: ${cartItem.search.to}
Distance: ${cartItem.search.distance || 0} km (each way)

OUTBOUND TRIP:
Date: ${cartItem.search.date}
Time: ${cartItem.search.time}

RETURN TRIP:
Date: ${cartItem.search.returnDate || 'N/A'}
Time: ${cartItem.search.returnTime || 'N/A'}

Fare Calculation:
Trip Fare (${cartItem.search.distance || 0} km): AED ${cartItem.totalPrice / 2}
Quantity: 2 trips (Round Trip)
Total Fare: AED ${cartItem.totalPrice}`
            : `Transport Booking: ${cartItem.taxi.name}
From: ${cartItem.search.from}
To: ${cartItem.search.to}
Distance: ${cartItem.search.distance || 0} km
Pickup: ${cartItem.search.date} at ${cartItem.search.time}

Fare Calculation:
Base Fare: AED ${cartItem.taxi.baseFare}
Distance Charge: ${cartItem.search.distance || 0} km × AED ${cartItem.taxi.perKmRate}/km = AED ${((cartItem.search.distance || 0) * cartItem.taxi.perKmRate).toFixed(2)}
Total Fare: AED ${cartItem.totalPrice}`,
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