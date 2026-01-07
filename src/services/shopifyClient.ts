import { SHOPIFY_CONFIG, SHOPIFY_GRAPHQL_URL, METAFIELD_NAMESPACES, METAFIELD_KEYS } from '../config/shopifyConfig';
import type { TaxiOption, TaxiVariant } from '../types';

// Request headers for Shopify API
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
};

// GraphQL query to fetch products with ALL variants
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          productType
          tags
          variants(first: 15) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          metafields(
            identifiers: [
              { namespace: "taxi_details", key: "vehicle_type" }
              { namespace: "taxi_details", key: "passengers" }
              { namespace: "taxi_details", key: "luggage" }
              { namespace: "taxi_details", key: "rating" }
              { namespace: "taxi_details", key: "reviews" }
              { namespace: "taxi_details", key: "base_fare" }
              { namespace: "taxi_details", key: "per_km_rate" }
              { namespace: "taxi_details", key: "estimated_arrival" }
              { namespace: "taxi_details", key: "popular" }
              { namespace: "features", key: "features_list" }
            ]
          ) {
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

/**
 * Parse variant title to extract KM range
 * Example: "0-50 km" → { min: 0, max: 50 }
 */
function parseKmRangeFromTitle(title: string): { min: number; max: number } | null {
  const match = title.match(/(\d+)-(\d+)/);
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2])
    };
  }
  return null;
}

/**
 * Parse variants from Shopify product
 */
function parseVariants(variantEdges: any[]): TaxiVariant[] {
  return variantEdges.map((edge: any) => {
    const variant = edge.node;

    // Try to parse KM range from variant title
    const kmRange = parseKmRangeFromTitle(variant.title) || { min: 0, max: 50 };

    return {
      id: variant.id,
      title: variant.title,
      price: parseFloat(variant.price?.amount || '0'),
      kmRangeMin: kmRange.min,
      kmRangeMax: kmRange.max
    };
  });
}

/**
 * Get metafield value with type parsing
 */
function getMetafieldValue(
  metafields: any[],
  namespace: string,
  key: string,
  defaultValue: any
): any {
  const metafield = metafields?.find(
    (m) => m?.namespace === namespace && m?.key === key
  );

  if (!metafield) return defaultValue;

  // Parse based on type
  switch (metafield.type) {
    case 'number_integer':
      return parseInt(metafield.value, 10);
    case 'number_decimal':
      return parseFloat(metafield.value);
    case 'boolean':
      return metafield.value === 'true';
    case 'list.single_line_text_field':
      try {
        return JSON.parse(metafield.value);
      } catch {
        return defaultValue;
      }
    default:
      return metafield.value;
  }
}

/**
 * Transform Shopify product to TaxiOption
 */
function transformProduct(product: any): TaxiOption {
  const metafields = product.metafields || [];
  const image = product.images?.edges?.[0]?.node?.url || '';
  const variantEdges = product.variants?.edges || [];
  const firstVariant = variantEdges[0]?.node;

  // Extract numeric ID
  const numericId = parseInt(product.id.split('/').pop() || '0', 10);

  // Parse ALL variants with KM ranges
  const variants = parseVariants(variantEdges);

  // Get metafield values
  const vehicleType = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.VEHICLE_TYPE,
    'Standard'
  );

  const passengers = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.PASSENGERS,
    4
  );

  const luggage = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.LUGGAGE,
    2
  );

  const rating = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.RATING,
    4.5
  );

  const reviews = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.REVIEWS,
    0
  );

  const baseFare = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.BASE_FARE,
    parseFloat(firstVariant?.price?.amount || '25')
  );

  const perKmRate = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.PER_KM_RATE,
    2.0
  );

  const estimatedArrival = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.ESTIMATED_ARRIVAL,
    '5-7 mins'
  );

  const popular = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.TAXI_DETAILS,
    METAFIELD_KEYS.POPULAR,
    false
  );

  const features = getMetafieldValue(
    metafields,
    METAFIELD_NAMESPACES.FEATURES,
    METAFIELD_KEYS.FEATURES_LIST,
    ['Air Conditioning', 'GPS Navigation']
  );

  return {
    id: numericId,
    shopifyId: firstVariant?.id || product.id,
    shopifyProductId: product.id,
    name: product.title,
    type: vehicleType,
    image: image,
    rating: rating,
    reviews: reviews,
    passengers: passengers,
    luggage: luggage,
    features: Array.isArray(features) ? features : [],
    baseFare: baseFare,
    perKmRate: perKmRate,
    estimatedArrival: estimatedArrival,
    popular: popular,
    variants: variants // All KM range variants
  };
}

/**
 * Fetch all taxi products from Shopify
 */
export async function fetchTaxiProducts(): Promise<TaxiOption[]> {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: GET_PRODUCTS_QUERY,
        variables: { first: 50 }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'GraphQL query failed');
    }

    const products = result.data?.products?.edges || [];
    return products.map((edge: any) => transformProduct(edge.node));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch single product by ID
 */
export async function fetchProductById(productId: string): Promise<TaxiOption | null> {
  try {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          metafields(
            identifiers: [
              { namespace: "taxi_details", key: "vehicle_type" }
              { namespace: "taxi_details", key: "passengers" }
              { namespace: "taxi_details", key: "luggage" }
              { namespace: "taxi_details", key: "rating" }
              { namespace: "taxi_details", key: "reviews" }
              { namespace: "taxi_details", key: "base_fare" }
              { namespace: "taxi_details", key: "per_km_rate" }
              { namespace: "taxi_details", key: "estimated_arrival" }
              { namespace: "taxi_details", key: "popular" }
              { namespace: "features", key: "features_list" }
            ]
          ) {
            namespace
            key
            value
            type
          }
        }
      }
    `;

    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { id: productId }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return null;
    }

    const product = result.data?.product;
    return product ? transformProduct(product) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default {
  fetchTaxiProducts,
  fetchProductById
};