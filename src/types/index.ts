export interface SearchDetails {
    serviceType?: 'transfers' | 'daily-rental';
    from: string;
    to: string;
    fromCoords?: { lat: number; lng: number };
    toCoords?: { lat: number; lng: number };
    distance?: number;
    duration?: string;
    date: string;
    time: string;
    passengers: number;
    tripType?: 'one-way' | 'return';
    returnDate?: string;
    returnTime?: string;

    // Daily Rental specific fields
    pickupDate?: string;
    pickupTime?: string;
    dropoffDate?: string;
    dropoffTime?: string;
    rentalType?: string;
    numberOfDays?: number;
    rentalHours?: number;
}
// Daily Rental Search Details
export interface DailyRentalSearchDetails {
    serviceType: 'daily-rental';
    pickupLocation: string;
    pickupCoords?: { lat: number; lng: number } | null;
    date: string;
    time: string;
    dropoffDate: string;
    dropoffTime: string;
    passengers: number;
}

// Taxi Variant - KM Range based pricing
export interface TaxiVariant {
    id: string; // Shopify variant ID (gid://shopify/ProductVariant/xxx)
    title: string; // e.g., "0-50 km" or "Daily Rental - Half Day" or "Daily Rental - Full Day"
    price: number; // Price for this range
    kmRangeMin: number; // e.g., 0
    kmRangeMax: number; // e.g., 50
}

// Taxi Option
export interface TaxiOption {
    id: number;
    shopifyId?: string; // Current selected variant ID (dynamic)
    shopifyProductId?: string; // Base product ID
    name: string;
    type: string;
    image: string;
    rating: number;
    reviews: number;
    passengers: number;
    luggage: number;
    features: string[];
    baseFare: number;
    perKmRate: number;
    estimatedArrival: string;
    popular?: boolean;
    description?: string;
    variants?: TaxiVariant[]; // All KM range variants
}

// Taxi Card Props
export interface TaxiCardProps {
    taxi: TaxiOption;
    isSelected: boolean;
    distance: number;
    duration: string;
    tripType?: 'one-way' | 'return';
    onSelect: (id: number) => void;
    onBookNow: (id: number) => void;
}

// Booking Details
export interface BookingDetails {
    taxi: TaxiOption;
    search: SearchDetails;
    totalPrice: number;
}

// Payment Details
export interface PaymentDetails extends BookingDetails {
    customerInfo?: {
        name: string;
        email: string;
        phone: string;
    };
    paymentMethod?: string;
}

export interface MapViewProps {
    from: string;
    to: string;
    fromCoords: { lat: number; lng: number };
    toCoords: { lat: number; lng: number };
    distance: number;
    duration: string;
    selectedTaxiId?: number | null;
}

export interface HeaderProps {
    searchDetails: SearchDetails;
    onEditSearch: () => void;
    isMobile?: boolean;
}

export interface FiltersProps {
    activeFilter: string;
    sortBy: 'price' | 'rating' | 'passengers';
    onFilterChange: (filter: string) => void;
    onSortChange: (sort: 'price' | 'rating' | 'passengers') => void;
}

export interface MobileBookingBarProps {
    selectedTaxi: TaxiOption | null;
    distance: number;
    onBookNow: () => void;
}