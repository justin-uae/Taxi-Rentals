export const SHOPIFY_CONFIG = {
    storeDomain: import.meta.env.VITE_SHOPIFY_DOMAIN,
    storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
    apiVersion: '2024-10',
};

// Shopify GraphQL endpoint
export const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

// Metafield namespaces for taxi options
export const METAFIELD_NAMESPACES = {
    TAXI_DETAILS: 'taxi_details',
    BOOKING_INFO: 'booking_info',
    FEATURES: 'features',
};

// Metafield keys
export const METAFIELD_KEYS = {
    // Taxi Details
    VEHICLE_TYPE: 'vehicle_type',
    PASSENGERS: 'passengers',
    LUGGAGE: 'luggage',
    RATING: 'rating',
    REVIEWS: 'reviews',
    BASE_FARE: 'base_fare',
    PER_KM_RATE: 'per_km_rate',
    ESTIMATED_ARRIVAL: 'estimated_arrival',
    POPULAR: 'popular',

    // Features (as JSON array)
    FEATURES_LIST: 'features_list',
};