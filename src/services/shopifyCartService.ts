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
 * Check if a location is an airport
 */
const isAirportLocation = (location: string): boolean => {
    const normalizedLocation = location.toLowerCase().trim();
    const airportKeywords = [
        'airport',
        'international airport',
        'dxb',
        'dubai airport',
        'abu dhabi airport',
        'auh',
        'sharjah airport',
        'shj',
        'terminal',
        'dwc',
        'al maktoum',
    ];

    return airportKeywords.some(keyword => normalizedLocation.includes(keyword));
};

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

const formatDateToReadable = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Get day with ordinal suffix
    const day = date.getDate();
    const suffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    // Get month name
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}${suffix(day)} ${month} ${year}`;
};

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
        { key: 'Booking Type', value: isDailyRental ? 'Daily Rental' : 'Transport Booking' },
        { key: 'Vehicle', value: cartItem.taxi.name },
    ];

    if (isDailyRental) {
        attributes.push(
            { key: 'Rental Type', value: cartItem.search.rentalType || 'Daily Rental' },
            { key: 'Pickup Location', value: cartItem.search.from },
            { key: 'Pickup Date', value: formatDateToReadable(cartItem.search.pickupDate || cartItem.search.date) },
            { key: 'Pickup Time', value: cartItem.search.pickupTime || cartItem.search.time },
            { key: 'Dropoff Date', value: formatDateToReadable(cartItem.search.dropoffDate || cartItem.search.date) },
            { key: 'Dropoff Time', value: cartItem.search.dropoffTime || '' },
            { key: 'Number of Days', value: `${cartItem.search.numberOfDays || 1}` },
            { key: 'Passengers', value: `${cartItem.search.passengers || 1}` }
        );

        // Add flight number if it's an airport trip
        if (cartItem.search.flightNumber) {
            attributes.push({ key: 'Flight Number', value: cartItem.search.flightNumber });
        }
    } else {
        // Transfer specific attributes
        attributes.push(
            { key: 'Trip Type', value: isReturn ? 'Round Trip' : 'One-Way' },
            { key: 'From Location', value: cartItem.search.from },
            { key: 'To Location', value: cartItem.search.to },
            { key: 'Distance', value: `${Math.round(cartItem.search.distance || 0)} km${isReturn ? ' (each way)' : ''}` },
            { key: 'Duration', value: cartItem.search.duration || '' },
            { key: 'Outbound Date', value: formatDateToReadable(cartItem.search.date) },
            { key: 'Outbound Time', value: cartItem.search.time }
        );

        // Return details (if applicable)
        if (isReturn && cartItem.search.returnDate) {
            attributes.push(
                { key: 'Return Date', value: formatDateToReadable(cartItem.search.returnDate) },
                { key: 'Return Time', value: cartItem.search.returnTime || '' }
            );
        }
    }

    return {
        merchandiseId: cartItem.taxi.shopifyId || '',
        quantity: quantity,
        attributes: attributes,
    };
};

/**
 * Creates cart with automatic parking fee ONLY for airport locations
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

    // Check if this is an airport location (pickup or destination)
    const pickupLocation = cartItem.search.from || '';
    const dropoffLocation = cartItem.search.to || '';
    const isAirportTrip = isAirportLocation(pickupLocation) || isAirportLocation(dropoffLocation);

    // Prepare parking fee if it's an airport trip
    let parkingFeeVariantId: string | null = null;
    if (isAirportTrip) {
        const vehicleType = cartItem.taxi.type || '';
        parkingFeeVariantId = getParkingFeeVariantId(vehicleType);

        if (!parkingFeeVariantId) {
            console.warn(`⚠ No parking fee product found for vehicle type: ${vehicleType}`);
        }
    }

    // Build lines array with correct order: 1. Vehicle, 2. Parking Fee
    const lines: ShopifyCartLineInput[] = [lineItem];

    // Add parking fee as second item if applicable
    if (isAirportTrip && parkingFeeVariantId) {
        lines.push({
            merchandiseId: parkingFeeVariantId,
            quantity: 1,
            attributes: [
                { key: 'Fee Type', value: 'Airport Parking Charge' },
            ]
        });
    }

    const isDailyRental = cartItem.search.serviceType === 'daily-rental';
    const isReturn = cartItem.search.tripType === 'return';

    const cartAttributes: Array<{ key: string; value: string }> = [
        { key: 'Booking Type', value: isDailyRental ? 'Daily Rental' : 'Transport Booking' },
        { key: 'Vehicle Name', value: cartItem.taxi.name },
        { key: 'Vehicle Category', value: cartItem.taxi.type || '' },
        { key: 'Airport Service', value: isAirportTrip ? 'Yes' : 'No' },
        { key: 'Parking Fee', value: parkingFeeVariantId ? 'Included' : 'Not Applicable' }
    ];

    if (isDailyRental) {
        cartAttributes.push(
            { key: 'Rental Type', value: cartItem.search.rentalType || 'Daily Rental' },
            { key: 'Pickup Location', value: cartItem.search.from },
            { key: 'Pickup Date', value: formatDateToReadable(cartItem.search.pickupDate || cartItem.search.date) },
            { key: 'Pickup Time', value: cartItem.search.pickupTime || cartItem.search.time },
            { key: 'Return Date', value: formatDateToReadable(cartItem.search.dropoffDate || '') },
            { key: 'Return Time', value: cartItem.search.dropoffTime || '' },
            { key: 'Total Hours', value: `${cartItem.search.rentalHours?.toFixed(1) || 0} hours` },
            { key: 'Number of Days', value: `${cartItem.search.numberOfDays || 1} day${(cartItem.search.numberOfDays || 1) > 1 ? 's' : ''}` },
            { key: 'Total Amount', value: `AED ${cartItem.totalPrice}` }
        );

        // Add flight number if provided
        if (cartItem.search.flightNumber) {
            cartAttributes.push({ key: 'Flight Number', value: cartItem.search.flightNumber });
        }
    } else {
        cartAttributes.push(
            { key: 'Trip Type', value: isReturn ? 'Round Trip' : 'One-Way' },
            { key: 'From', value: cartItem.search.from },
            { key: 'To', value: cartItem.search.to },
            { key: 'Departure Date', value: formatDateToReadable(cartItem.search.date) },
            { key: 'Departure Time', value: cartItem.search.time },
            { key: 'Distance', value: `${Math.round(cartItem.search.distance || 0)} km` },
            { key: 'Total Amount', value: `AED ${cartItem.totalPrice}` }
        );

        if (isReturn && cartItem.search.returnDate) {
            cartAttributes.push(
                { key: 'Return Date', value: formatDateToReadable(cartItem.search.returnDate) },
                { key: 'Return Time', value: cartItem.search.returnTime || '' }
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
Vehicle Type: ${cartItem.taxi.type || ''}
${isAirportTrip ? 'AIRPORT LOCATION' : ''}

Rental Type: ${cartItem.search.rentalType || 'Daily Rental'}
Pickup Location: ${cartItem.search.from}

PICKUP:
Date: ${formatDateToReadable(cartItem.search.pickupDate || cartItem.search.date)}
Time: ${cartItem.search.pickupTime || cartItem.search.time}

DROPOFF:
Date: ${formatDateToReadable(cartItem.search.dropoffDate || '')}
Time: ${cartItem.search.dropoffTime || ''}

${cartItem.search.flightNumber ? `Flight Number: ${cartItem.search.flightNumber}\n` : ''}
Duration: ${hours.toFixed(1)} hours (${days} day${days > 1 ? 's' : ''})
Passengers: ${cartItem.search.passengers || 1}

Fare Calculation:
${days > 1 ? `Daily Rate: AED ${pricePerDay}
Quantity: ${days} day${days > 1 ? 's' : ''}` : `Rate: AED ${pricePerDay}`}
Total Fare: AED ${cartItem.totalPrice}${isAirportTrip && parkingFeeVariantId ? `
+ Airport Parking Fee - ${cartItem.taxi.type} (see line items)` : ''}`;
    } else if (isReturn) {
        note = `Round Trip Transport Booking: ${cartItem.taxi.name}
Vehicle Type: ${cartItem.taxi.type || ''}
${isAirportTrip ? '🛫 AIRPORT LOCATION' : ''}

From: ${cartItem.search.from}
To: ${cartItem.search.to}
Distance: ${Math.round(cartItem.search.distance || 0)} km (each way)

OUTBOUND TRIP:
Date: ${formatDateToReadable(cartItem.search.date)}
Time: ${cartItem.search.time}

RETURN TRIP:
Date: ${formatDateToReadable(cartItem.search.returnDate || '')}
Time: ${cartItem.search.returnTime || 'N/A'}

Fare Calculation:
Trip Fare (${Math.round(cartItem.search.distance || 0)} km): AED ${cartItem.totalPrice / 2}
Quantity: 2 trips (Round Trip)
Total Fare: AED ${cartItem.totalPrice}${isAirportTrip && parkingFeeVariantId ? `
+ Airport Parking Fee - ${cartItem.taxi.type} (see line items)` : ''}`;
    } else {
        note = `Transport Booking: ${cartItem.taxi.name}
Vehicle Type: ${cartItem.taxi.type || ''}
${isAirportTrip ? 'AIRPORT LOCATION' : ''}

From: ${cartItem.search.from}
To: ${cartItem.search.to}
Distance: ${Math.round(cartItem.search.distance || 0)} km
Pickup: ${formatDateToReadable(cartItem.search.date)} at ${cartItem.search.time}

Fare Calculation:
Base Fare: AED ${cartItem.taxi.baseFare}
Distance Charge: ${Math.round(cartItem.search.distance || 0)} km × AED ${cartItem.taxi.perKmRate}/km = AED ${((cartItem.search.distance || 0) * cartItem.taxi.perKmRate).toFixed(2)}
Total Fare: AED ${cartItem.totalPrice}${isAirportTrip && parkingFeeVariantId ? `
+ Airport Parking Fee - ${cartItem.taxi.type} (see line items)` : ''}`;
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