import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Lock } from 'lucide-react';
import type { SearchDetails, TaxiOption } from '../types';
import { useMobile } from '../hooks/useMobile';
import TaxiHeader from '../Components/TaxiOptions/TaxiHeader';
import MapView from '../Components/TaxiOptions/MapView';
import Filters from '../Components/TaxiOptions/Filters';
import TaxiCard from '../Components/TaxiOptions/TaxiCard';

// Import taxi data
const taxiOptions: TaxiOption[] = [
    {
        id: 1,
        name: "Economy Sedan",
        type: "Standard",
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop",
        rating: 4.6,
        reviews: 1234,
        passengers: 4,
        luggage: 2,
        features: ["Air Conditioning", "GPS Navigation", "Clean Interior"],
        baseFare: 25,
        perKmRate: 2.0,
        estimatedArrival: "5-7 mins"
    },
    {
        id: 2,
        name: "Comfort Sedan",
        type: "Premium",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
        rating: 4.8,
        reviews: 2156,
        passengers: 4,
        luggage: 3,
        features: ["Air Conditioning", "GPS Navigation", "Leather Seats", "Premium Audio", "Free Water"],
        baseFare: 35,
        perKmRate: 2.5,
        popular: true,
        estimatedArrival: "3-5 mins"
    },
    {
        id: 3,
        name: "SUV",
        type: "Spacious",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
        rating: 4.7,
        reviews: 987,
        passengers: 6,
        luggage: 4,
        features: ["Air Conditioning", "GPS Navigation", "Extra Space", "Child Seat Available", "Phone Charger"],
        baseFare: 45,
        perKmRate: 3.0,
        estimatedArrival: "7-10 mins"
    },
    {
        id: 4,
        name: "Luxury Sedan",
        type: "Executive",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop",
        rating: 4.9,
        reviews: 3421,
        passengers: 4,
        luggage: 3,
        features: ["Chauffeur Service", "Leather Seats", "Premium Audio", "Bottled Water", "Newspaper", "WiFi"],
        baseFare: 70,
        perKmRate: 4.0,
        popular: true,
        estimatedArrival: "10-12 mins"
    },
    {
        id: 5,
        name: "Van/Minibus",
        type: "Group",
        image: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=250&fit=crop",
        rating: 4.5,
        reviews: 654,
        passengers: 8,
        luggage: 6,
        features: ["Air Conditioning", "Extra Luggage Space", "Group Friendly", "Entertainment System"],
        baseFare: 50,
        perKmRate: 3.5,
        estimatedArrival: "12-15 mins"
    },
    {
        id: 6,
        name: "Electric Vehicle",
        type: "Eco-Friendly",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop",
        rating: 5.0,
        reviews: 892,
        passengers: 5,
        luggage: 2,
        features: ["Zero Emissions", "Silent Ride", "Premium Interior", "Fast Charging", "Sustainable"],
        baseFare: 40,
        perKmRate: 2.8,
        estimatedArrival: "8-10 mins"
    }
];

const TaxiOptions: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMobile();

    // State
    const [searchDetails, setSearchDetails] = useState<SearchDetails>({
        from: "Dubai Airport (DXB)",
        to: "Burj Khalifa",
        fromCoords: { lat: 25.2532, lng: 55.3657 },
        toCoords: { lat: 25.1972, lng: 55.2744 },
        distance: 18.5,
        duration: "25 mins",
        date: "01/15/2025",
        time: "10:00 AM"
    });

    const [selectedTaxi, setSelectedTaxi] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'passengers'>('price');

    // Update search details from homepage
    useEffect(() => {
        if (location.state) {
            const state = location.state as SearchDetails;
            setSearchDetails({
                ...state,
                fromCoords: state.fromCoords || { lat: 25.2532, lng: 55.3657 },
                toCoords: state.toCoords || { lat: 25.1972, lng: 55.2744 },
                distance: state.distance || 18.5,
                duration: state.duration || "25 mins"
            });
        }
    }, [location]);

    // Calculate price helper function
    const calculatePrice = (baseFare: number, perKmRate: number, distance: number) => {
        return Math.round(baseFare + (perKmRate * distance));
    };

    // Filter and sort taxi options
    const filteredAndSortedTaxiOptions = [...taxiOptions]
        .filter(taxi => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'popular') return taxi.popular;
            if (activeFilter === 'economy') return taxi.perKmRate <= 2.5;
            if (activeFilter === 'premium') return taxi.perKmRate > 3.5;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price') {
                const priceA = calculatePrice(a.baseFare, a.perKmRate, searchDetails.distance || 0);
                const priceB = calculatePrice(b.baseFare, b.perKmRate, searchDetails.distance || 0);
                return priceA - priceB;
            } else if (sortBy === 'rating') {
                return b.rating - a.rating;
            } else {
                return b.passengers - a.passengers;
            }
        });

    // Event handlers
    const handleBookNow = (taxiId: number) => {
        setSelectedTaxi(taxiId);
    };

    const handleProceedToPay = () => {
        const selectedTaxiData = taxiOptions.find(taxi => taxi.id === selectedTaxi);
        if (selectedTaxiData) {
            const totalPrice = calculatePrice(
                selectedTaxiData.baseFare,
                selectedTaxiData.perKmRate,
                searchDetails.distance || 0
            );

            // Navigate to payment page
            navigate('/payment', {
                state: {
                    taxi: selectedTaxiData,
                    search: searchDetails,
                    totalPrice: totalPrice
                }
            });
        }
    };

    const handleEditSearch = () => {
        navigate('/');
    };

    // Selected taxi data for booking bar
    const selectedTaxiData = taxiOptions.find(t => t.id === selectedTaxi) || null;

    const distance = searchDetails.distance || 18.5;
    const duration = searchDetails.duration || "25 mins";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-24">
            {/* Fixed Header */}
            <div className="bg-white shadow-lg sticky top-16 z-40 border-b border-gray-200">
                <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <TaxiHeader
                        searchDetails={searchDetails}
                        onEditSearch={handleEditSearch}
                        isMobile={isMobile}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Mobile Layout */}
                {isMobile && (
                    <>
                        {/* Map Section */}
                        <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Navigation className="h-4 w-4 text-blue-600" />
                                    Route Map
                                </h2>
                            </div>
                            <div className="h-64 sm:h-80 p-2">
                                <MapView
                                    from={searchDetails.from}
                                    to={searchDetails.to}
                                    fromCoords={searchDetails.fromCoords || { lat: 25.2532, lng: 55.3657 }}
                                    toCoords={searchDetails.toCoords || { lat: 25.1972, lng: 55.2744 }}
                                    distance={distance}
                                    duration={duration}
                                    selectedTaxiId={selectedTaxi}
                                />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900 mb-1">
                                Available Rides ({filteredAndSortedTaxiOptions.length})
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Select your preferred vehicle
                            </p>
                        </div>

                        {/* Filters */}
                        <Filters
                            activeFilter={activeFilter}
                            sortBy={sortBy}
                            onFilterChange={setActiveFilter}
                            onSortChange={setSortBy}
                        />

                        {/* Taxi Options List */}
                        <div className="space-y-3">
                            {filteredAndSortedTaxiOptions.map((taxi) => (
                                <TaxiCard
                                    key={taxi.id}
                                    taxi={taxi}
                                    isSelected={selectedTaxi === taxi.id}
                                    distance={distance}
                                    duration={duration}
                                    onSelect={setSelectedTaxi}
                                    onBookNow={handleBookNow}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Desktop Layout */}
                {!isMobile && (
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Taxi Options */}
                        <div className="lg:col-span-2">
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                    Available Rides <span className="text-orange-600">({filteredAndSortedTaxiOptions.length})</span>
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    Select your preferred vehicle for the journey
                                </p>

                                {/* Filters */}
                                <Filters
                                    activeFilter={activeFilter}
                                    sortBy={sortBy}
                                    onFilterChange={setActiveFilter}
                                    onSortChange={setSortBy}
                                />
                            </div>

                            {/* Taxi Options List */}
                            <div className="space-y-4">
                                {filteredAndSortedTaxiOptions.map((taxi) => (
                                    <TaxiCard
                                        key={taxi.id}
                                        taxi={taxi}
                                        isSelected={selectedTaxi === taxi.id}
                                        distance={distance}
                                        duration={duration}
                                        onSelect={setSelectedTaxi}
                                        onBookNow={handleBookNow}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Map & Booking Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4">
                                {/* Booking Summary - Show first when taxi is selected */}
                                {selectedTaxiData && (
                                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-500 animate-slideIn">
                                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                                            <h3 className="text-lg font-bold mb-1">Booking Summary</h3>
                                            <p className="text-sm text-orange-100">Review your selection</p>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {/* Selected Vehicle */}
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Selected Vehicle</p>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={selectedTaxiData.image}
                                                        alt={selectedTaxiData.name}
                                                        className="w-16 h-10 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{selectedTaxiData.name}</p>
                                                        <p className="text-xs text-gray-500">{selectedTaxiData.type}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Journey Details */}
                                            <div className="border-t border-gray-200 pt-3">
                                                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Journey Details</p>
                                                <div className="space-y-1.5 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance</span>
                                                        <span className="font-semibold text-gray-900">{distance.toFixed(1)} km</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Duration</span>
                                                        <span className="font-semibold text-gray-900">{duration}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price Breakdown */}
                                            <div className="border-t border-gray-200 pt-3">
                                                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Price Breakdown</p>
                                                <div className="space-y-1.5 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Base Fare</span>
                                                        <span className="font-semibold text-gray-900">AED {selectedTaxiData.baseFare}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Distance ({distance.toFixed(1)} km)</span>
                                                        <span className="font-semibold text-gray-900">
                                                            AED {(selectedTaxiData.perKmRate * distance).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                                        <span className="font-bold text-gray-900">Total Amount</span>
                                                        <span className="text-xl font-bold text-orange-600">
                                                            AED {calculatePrice(selectedTaxiData.baseFare, selectedTaxiData.perKmRate, distance)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Proceed to Pay Button */}
                                            <button
                                                onClick={handleProceedToPay}
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group mt-4"
                                            >
                                                <Lock className="h-5 w-5" />
                                                <span>Proceed to Pay</span>
                                            </button>

                                            <p className="text-xs text-center text-gray-500">
                                                Secure payment
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Map - Show below booking summary or first if no taxi selected */}
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-4 border-b border-gray-200">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Navigation className="h-5 w-5 text-blue-600" />
                                            Route Map
                                        </h2>
                                        <p className="text-gray-600 text-xs mt-1 truncate">
                                            {searchDetails.from} → {searchDetails.to}
                                        </p>
                                    </div>

                                    <div className="h-[350px] p-3">
                                        <MapView
                                            from={searchDetails.from}
                                            to={searchDetails.to}
                                            fromCoords={searchDetails.fromCoords || { lat: 25.2532, lng: 55.3657 }}
                                            toCoords={searchDetails.toCoords || { lat: 25.1972, lng: 55.2744 }}
                                            distance={distance}
                                            duration={duration}
                                            selectedTaxiId={selectedTaxi}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Booking Bar - Updated with Proceed to Pay */}
            {isMobile && selectedTaxiData && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 animate-slideUp">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Selected Vehicle</p>
                                <p className="font-bold text-gray-900 truncate">{selectedTaxiData.name}</p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-orange-600">
                                        AED {calculatePrice(selectedTaxiData.baseFare, selectedTaxiData.perKmRate, distance)}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={handleProceedToPay}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Lock className="h-4 w-4" />
                                Proceed to Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default TaxiOptions;