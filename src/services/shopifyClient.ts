import { SHOPIFY_CONFIG, SHOPIFY_GRAPHQL_URL, METAFIELD_NAMESPACES, METAFIELD_KEYS } from '../config/shopifyConfig';
import type { TaxiOption } from '../types';

class ShopifyClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
    };
  }

  // GraphQL query to fetch products with metafields
  private getProductsQuery() {
    return `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              productType
              tags
              variants(first: 1) {
                edges {
                  node {
                    id
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
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.VEHICLE_TYPE}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.PASSENGERS}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.LUGGAGE}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.RATING}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.REVIEWS}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.BASE_FARE}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.PER_KM_RATE}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.ESTIMATED_ARRIVAL}" }
                  { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.POPULAR}" }
                  { namespace: "${METAFIELD_NAMESPACES.FEATURES}", key: "${METAFIELD_KEYS.FEATURES_LIST}" }
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
  }

  // GraphQL query to fetch a single product by ID
  private getProductByIdQuery() {
    return `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          productType
          tags
          variants(first: 1) {
            edges {
              node {
                id
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
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.VEHICLE_TYPE}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.PASSENGERS}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.LUGGAGE}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.RATING}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.REVIEWS}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.BASE_FARE}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.PER_KM_RATE}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.ESTIMATED_ARRIVAL}" }
              { namespace: "${METAFIELD_NAMESPACES.TAXI_DETAILS}", key: "${METAFIELD_KEYS.POPULAR}" }
              { namespace: "${METAFIELD_NAMESPACES.FEATURES}", key: "${METAFIELD_KEYS.FEATURES_LIST}" }
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
  }

  // Make GraphQL request
  private async makeRequest(query: string, variables?: any) {
    try {
      const response = await fetch(SHOPIFY_GRAPHQL_URL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        console.error('Shopify GraphQL Errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'GraphQL query failed');
      }

      return data.data;
    } catch (error) {
      console.error('Shopify API Error:', error);
      throw error;
    }
  }

  // Helper function to get metafield value
  private getMetafieldValue(metafields: any[], namespace: string, key: string, defaultValue: any = null) {
    const metafield = metafields?.find(
      (mf) => mf?.namespace === namespace && mf?.key === key
    );
    
    if (!metafield) return defaultValue;

    // Parse based on metafield type
    switch (metafield.type) {
      case 'number_integer':
        return parseInt(metafield.value, 10);
      case 'number_decimal':
        return parseFloat(metafield.value);
      case 'boolean':
        return metafield.value === 'true';
      case 'json':
        try {
          return JSON.parse(metafield.value);
        } catch {
          return defaultValue;
        }
      default:
        return metafield.value;
    }
  }

  // Transform Shopify product to TaxiOption
  private transformProductToTaxiOption(product: any): TaxiOption {
    const metafields = product.metafields || [];
    const image = product.images?.edges?.[0]?.node?.url || '';
    const variant = product.variants?.edges?.[0]?.node;
    
    // Extract numeric ID from Shopify GID
    const numericId = parseInt(product.id.split('/').pop() || '0', 10);

    // Get metafield values with defaults
    const vehicleType = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.VEHICLE_TYPE,
      'Standard'
    );

    const passengers = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.PASSENGERS,
      4
    );

    const luggage = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.LUGGAGE,
      2
    );

    const rating = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.RATING,
      4.5
    );

    const reviews = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.REVIEWS,
      0
    );

    const baseFare = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.BASE_FARE,
      parseFloat(variant?.price?.amount || '25')
    );

    const perKmRate = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.PER_KM_RATE,
      2.0
    );

    const estimatedArrival = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.ESTIMATED_ARRIVAL,
      '5-7 mins'
    );

    const popular = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.TAXI_DETAILS,
      METAFIELD_KEYS.POPULAR,
      false
    );

    const features = this.getMetafieldValue(
      metafields,
      METAFIELD_NAMESPACES.FEATURES,
      METAFIELD_KEYS.FEATURES_LIST,
      ['Air Conditioning', 'GPS Navigation']
    );

    return {
      id: numericId,
      shopifyId: variant?.id || product.id, // Use variant ID for checkout
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
      description: product.description,
    };
  }

  // Fetch all products
  async fetchProducts(limit: number = 50): Promise<TaxiOption[]> {
    try {
      const data = await this.makeRequest(this.getProductsQuery(), {
        first: limit,
      });

      const products = data.products?.edges?.map((edge: any) => 
        this.transformProductToTaxiOption(edge.node)
      ) || [];

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Fetch product by ID
  async fetchProductById(productId: string): Promise<TaxiOption> {
    try {
      // Convert numeric ID to Shopify GID if needed
      const gid = productId.startsWith('gid://') 
        ? productId 
        : `gid://shopify/Product/${productId}`;

      const data = await this.makeRequest(this.getProductByIdQuery(), {
        id: gid,
      });

      if (!data.product) {
        throw new Error('Product not found');
      }

      return this.transformProductToTaxiOption(data.product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }
}

export const shopifyClient = new ShopifyClient();