export interface TaxiOption {
    id: number;
    name: string;
    type: string;
    image: string;
    rating: number;
    reviews: number;
    passengers: number;
    luggage: number;
    features: string[];
    perKmRate: number;
    baseFare: number;
    popular?: boolean;
    estimatedArrival?: string;
}

export interface SearchDetails {
    from: string;
    to: string;
    fromCoords?: { lat: number; lng: number };
    toCoords?: { lat: number; lng: number };
    distance?: number;
    duration?: string;
    date: string;
    time: string;
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

export interface TaxiCardProps {
    taxi: TaxiOption;
    isSelected: boolean;
    distance: number;
    duration: string;
    onSelect: (id: number) => void;
    onBookNow: (id: number) => void;
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