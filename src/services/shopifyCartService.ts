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
 * Get exact parking fee variant ID for each specific vehicle type
 * Returns null if no matching parking fee is found
 */
const getParkingFeeVariantId = (vehicleType: string): string | null => {
    // Normalize the vehicle type (trim and lowercase for comparison)
    const normalizedType = vehicleType.trim().toLowerCase();

    const parkingFeeMap: { [key: string]: string } = {
        'standard sedan': import.meta.env.VITE_PARKING_FEE_STANDARD_SEDAN,
        'budget group transport': import.meta.env.VITE_PARKING_FEE_BUDGET_GROUP_TRANSPORT,
        'luxury limousine': import.meta.env.VITE_PARKING_FEE_LUXURY_LIMOUSINE,
        'luxury group transport': import.meta.env.VITE_PARKING_FEE_LUXURY_GROUP_TRANSPORT,
        'luxury vip group transport': import.meta.env.VITE_PARKING_FEE_LUXURY_VIP_GROUP_TRANSPORT,
        'executive minibus': import.meta.env.VITE_PARKING_FEE_EXECUTIVE_MINIBUS,
        'executive minivan': import.meta.env.VITE_PARKING_FEE_EXECUTIVE_MINIVAN,
        'luxury sedan': import.meta.env.VITE_PARKING_FEE_LUXURY_SEDAN,
        'luxury suv': import.meta.env.VITE_PARKING_FEE_LUXURY_SUV,
        'large group transport': import.meta.env.VITE_PARKING_FEE_LARGE_GROUP_TRANSPORT,
        'vip luxury sedan': import.meta.env.VITE_PARKING_FEE_VIP_LUXURY_SEDAN,
    };

    const variantId = parkingFeeMap[normalizedType];

    if (!variantId) {
        console.warn(`No parking fee configured for vehicle type: "${vehicleType}"`);
        return null;
    }

    return variantId;
};

/**
 * Convert cart item to Shopify line input
 * 
 * PRICING STRATEGY:
 * - One-way trip: quantity = 1
 * - Return trip: quantity = 2 (represents 2 trips with same variant)
 * - Daily Rental: quantity = number of days (calculated from hours)
 * 
 * This allows dynamic pricing while using Shopify's native system
 */
export const cartItemToLineInput = (cartItem: CartItem): ShopifyCartLineInput => {
    const isReturn = cartItem.search.tripType === 'return';
    const isDailyRental = cartItem.search.serviceType === 'daily-rental';

    // Determine quantity based on booking type
    let quantity = 1;
    if (isDailyRental) {
        // For daily rentals, use the calculated quantity (number of days)
        quantity = cartItem.quantity || 1;
    } else if (isReturn) {
        // For return trips, quantity is 2
        quantity = 2;
    }

    // Build attributes based on booking type
    const attributes: Array<{ key: string; value: string }> = [
        { key: 'booking_type', value: isDailyRental ? 'Daily Rental' : 'Transport Booking' },
        { key: 'vehicle', value: cartItem.taxi.name },
    ];

    if (isDailyRental) {
        attributes.push(
            { key: 'rental_type', value: cartItem.search.rentalType || 'Daily Rental' },
            { key: 'pickup_location', value: cartItem.search.from },
            { key: 'pickup_date', value: cartItem.search.pickupDate || cartItem.search.date },
            { key: 'pickup_time', value: cartItem.search.pickupTime || cartItem.search.time },
            { key: 'dropoff_date', value: cartItem.search.dropoffDate || cartItem.search.date },
            { key: 'dropoff_time', value: cartItem.search.dropoffTime || '' },
            { key: 'rental_hours', value: `${cartItem.search.rentalHours?.toFixed(1) || 0}` },
            { key: 'number_of_days', value: `${cartItem.search.numberOfDays || 1}` },
            { key: 'passengers', value: `${cartItem.search.passengers || 1}` },
            { key: 'total_fare', value: `AED ${cartItem.totalPrice}` }
        );
    } else {
        // Transfer specific attributes
        attributes.push(
            { key: 'trip_type', value: isReturn ? 'Round Trip' : 'One-Way' },
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'distance', value: `${cartItem.search.distance || 0} km${isReturn ? ' (each way)' : ''}` },
            { key: 'duration', value: cartItem.search.duration || '' },
            { key: 'outbound_date', value: cartItem.search.date },
            { key: 'outbound_time', value: cartItem.search.time }
        );

        // Return details (if applicable)
        if (isReturn && cartItem.search.returnDate) {
            attributes.push(
                { key: 'return_date', value: cartItem.search.returnDate },
                { key: 'return_time', value: cartItem.search.returnTime || '' }
            );
        }

        attributes.push({ key: 'total_fare', value: `AED ${cartItem.totalPrice}` });
    }

    return {
        merchandiseId: cartItem.taxi.shopifyId || '',
        quantity: quantity,
        attributes: attributes,
    };
};

/**
 * Creates cart with automatic parking fee based on exact vehicle type
 * @param cartItem - The booking item
 * @param email - Customer email (optional)
 */
export const createCart = async (
    cartItem: CartItem,
    email?: string
): Promise<string> => {
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
            subtotalAmount {
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

    // Start with main booking line item
    const lines: ShopifyCartLineInput[] = [lineItem];

    // AUTOMATICALLY add specific parking fee for this vehicle type
    const vehicleType = cartItem.taxi.type || '';
    const parkingFeeVariantId = getParkingFeeVariantId(vehicleType);

    if (parkingFeeVariantId) {
        lines.push({
            merchandiseId: parkingFeeVariantId,
            quantity: 1,
            attributes: [
                { key: 'fee_type', value: 'Parking Fee' },
                { key: 'vehicle_type', value: vehicleType },
                { key: 'related_to', value: cartItem.taxi.name },
                { key: 'booking_date', value: cartItem.search.date }
            ]
        });
    } else {
        console.warn(`⚠ No parking fee product found for vehicle type: ${vehicleType}`);
    }

    const isDailyRental = cartItem.search.serviceType === 'daily-rental';
    const isReturn = cartItem.search.tripType === 'return';

    const cartAttributes: Array<{ key: string; value: string }> = [
        { key: 'booking_type', value: isDailyRental ? 'daily_rental' : 'transport_booking' },
        { key: 'vehicle_name', value: cartItem.taxi.name },
        { key: 'vehicle_type', value: vehicleType },
        { key: 'parking_fee_included', value: parkingFeeVariantId ? 'yes' : 'no' }
    ];

    if (isDailyRental) {
        cartAttributes.push(
            { key: 'rental_type', value: cartItem.search.rentalType || 'Daily Rental' },
            { key: 'pickup_location', value: cartItem.search.from },
            { key: 'pickup_date', value: cartItem.search.pickupDate || cartItem.search.date },
            { key: 'pickup_time', value: cartItem.search.pickupTime || cartItem.search.time },
            { key: 'dropoff_date', value: cartItem.search.dropoffDate || '' },
            { key: 'dropoff_time', value: cartItem.search.dropoffTime || '' },
            { key: 'rental_hours', value: `${cartItem.search.rentalHours?.toFixed(1) || 0}` },
            { key: 'number_of_days', value: `${cartItem.search.numberOfDays || 1}` },
            { key: 'calculated_total', value: `${cartItem.totalPrice}` }
        );
    } else {
        cartAttributes.push(
            { key: 'trip_type', value: isReturn ? 'return' : 'one-way' },
            { key: 'from_location', value: cartItem.search.from },
            { key: 'to_location', value: cartItem.search.to },
            { key: 'outbound_date', value: cartItem.search.date },
            { key: 'outbound_time', value: cartItem.search.time },
            { key: 'distance_km', value: `${cartItem.search.distance || 0}` },
            { key: 'calculated_total', value: `${cartItem.totalPrice}` }
        );

        if (isReturn && cartItem.search.returnDate) {
            cartAttributes.push(
                { key: 'return_date', value: cartItem.search.returnDate },
                { key: 'return_time', value: cartItem.search.returnTime || '' }
            );
        }
    }

    // Build the note based on booking type
    let note = '';
    if (isDailyRental) {
        const hours = cartItem.search.rentalHours || 0;
        const days = cartItem.search.numberOfDays || 1;
        const pricePerDay = days > 1 ? (cartItem.totalPrice / days).toFixed(2) : cartItem.totalPrice.toFixed(2);

        note = `Daily Rental Booking: ${cartItem.taxi.name}
Vehicle Type: ${vehicleType}

Rental Type: ${cartItem.search.rentalType || 'Daily Rental'}
Pickup Location: ${cartItem.search.from}

PICKUP:
Date: ${cartItem.search.pickupDate || cartItem.search.date}
Time: ${cartItem.search.pickupTime || cartItem.search.time}

DROPOFF:
Date: ${cartItem.search.dropoffDate || ''}
Time: ${cartItem.search.dropoffTime || ''}

Duration: ${hours.toFixed(1)} hours (${days} day${days > 1 ? 's' : ''})
Passengers: ${cartItem.search.passengers || 1}

Fare Calculation:
${days > 1 ? `Daily Rate: AED ${pricePerDay}
Quantity: ${days} day${days > 1 ? 's' : ''}` : `Rate: AED ${pricePerDay}`}
Total Fare: AED ${cartItem.totalPrice}
+ Parking Fee - ${vehicleType} (see line items)`;
    } else if (isReturn) {
        note = `Round Trip Transport Booking: ${cartItem.taxi.name}
Vehicle Type: ${vehicleType}

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
Total Fare: AED ${cartItem.totalPrice}
+ Parking Fee - ${vehicleType} (see line items)`;
    } else {
        note = `Transport Booking: ${cartItem.taxi.name}
Vehicle Type: ${vehicleType}

From: ${cartItem.search.from}
To: ${cartItem.search.to}
Distance: ${cartItem.search.distance || 0} km
Pickup: ${cartItem.search.date} at ${cartItem.search.time}

Fare Calculation:
Base Fare: AED ${cartItem.taxi.baseFare}
Distance Charge: ${cartItem.search.distance || 0} km × AED ${cartItem.taxi.perKmRate}/km = AED ${((cartItem.search.distance || 0) * cartItem.taxi.perKmRate).toFixed(2)}
Total Fare: AED ${cartItem.totalPrice}
+ Parking Fee - ${vehicleType} (see line items)`;
    }

    const cartInput: any = {
        lines: lines,
        attributes: cartAttributes,
        note: note,
    };

    // Add buyer identity with email if provided
    if (email) {
        cartInput.buyerIdentity = {
            email: email,
            countryCode: 'AE',
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