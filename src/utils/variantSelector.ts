import type { TaxiVariant } from '../types';

/**
 * Select the correct variant based on trip distance
 * 
 * EXAMPLE:
 * Distance: 75 km
 * Variants: [0-50, 51-100, 101-150, 151-200]
 * Returns: 51-100 km variant 
 */
export const selectVariantByDistance = (
    variants: TaxiVariant[],
    distance: number
): TaxiVariant | null => {
    if (!variants || variants.length === 0) {
        console.error('No variants available');
        return null;
    }

    if (!distance || distance <= 0) {
        console.warn('Invalid distance:', distance);
        return variants[0]; // Return first (lowest) variant as fallback
    }

    // Find variant where distance falls within range
    const matchingVariant = variants.find(
        v => distance >= v.kmRangeMin && distance <= v.kmRangeMax
    );

    if (matchingVariant) {
        console.log(' Variant selected:', {
            distance: `${distance} km`,
            variant: matchingVariant.title,
            range: `${matchingVariant.kmRangeMin}-${matchingVariant.kmRangeMax} km`,
            price: `${matchingVariant.price} AED`
        });
        return matchingVariant;
    }

    // If distance exceeds all ranges, return highest variant
    const sortedByRange = [...variants].sort((a, b) => b.kmRangeMax - a.kmRangeMax);
    const highestVariant = sortedByRange[0];

    console.warn('Distance exceeds all variants:', {
        distance: `${distance} km`,
        highestRange: `${highestVariant.kmRangeMax} km`,
        usingVariant: highestVariant.title
    });

    return highestVariant;
};

/**
 * Parse variant title to extract KM range
 * 
 * Examples:
 * "0-50 km" → { min: 0, max: 50 }
 * "51-100 km" → { min: 51, max: 100 }
 * "101-150 km" → { min: 101, max: 150 }
 */
export const parseKmRange = (
    title: string
): { min: number; max: number } | null => {
    // Match patterns like: "0-50", "51-100", "0-50 km", "51-100km"
    const match = title.match(/(\d+)-(\d+)/);

    if (match) {
        return {
            min: parseInt(match[1]),
            max: parseInt(match[2])
        };
    }

    console.warn('Could not parse KM range from title:', title);
    return null;
};

/**
 * Check if distance is within a specific range
 */
export const isDistanceInRange = (
    distance: number,
    rangeMin: number,
    rangeMax: number
): boolean => {
    return distance >= rangeMin && distance <= rangeMax;
};

/**
 * Get all variants sorted by range (ascending)
 */
export const sortVariantsByRange = (
    variants: TaxiVariant[]
): TaxiVariant[] => {
    return [...variants].sort((a, b) => a.kmRangeMin - b.kmRangeMin);
};

/**
 * Format variant range for display
 */
export const formatVariantRange = (variant: TaxiVariant): string => {
    return `${variant.kmRangeMin}-${variant.kmRangeMax} km`;
};

/**
 * Get recommended KM range tiers
 */
export const getRecommendedKmRanges = (): Array<{ min: number; max: number }> => {
    return [
        { min: 0, max: 50 },
        { min: 51, max: 100 },
        { min: 101, max: 150 },
        { min: 151, max: 200 },
        { min: 201, max: 300 },
    ];
};

/**
 * Example Usage:
 * 
 * const variants = [
 *   { id: 'var1', title: '0-50 km', price: 50, kmRangeMin: 0, kmRangeMax: 50 },
 *   { id: 'var2', title: '51-100 km', price: 100, kmRangeMin: 51, kmRangeMax: 100 },
 *   { id: 'var3', title: '101-150 km', price: 150, kmRangeMin: 101, kmRangeMax: 150 }
 * ];
 * 
 * const distance = 75; // km
 * const selected = selectVariantByDistance(variants, distance);
 * // Returns: { id: 'var2', title: '51-100 km', price: 100, ... }
 */