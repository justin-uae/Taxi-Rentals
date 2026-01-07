import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import type { SearchDetails } from '../types';
import { useMobile } from '../hooks/useMobile';
import TaxiHeader from '../Components/TaxiOptions/TaxiHeader';
import MapView from '../Components/TaxiOptions/MapView';
import Filters from '../Components/TaxiOptions/Filters';
import TaxiCard from '../Components/TaxiOptions/TaxiCard';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTaxiProducts } from '../store/slices/shopifySlice';
import { createCheckout } from '../store/slices/cartSlice';

const TaxiOptions: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMobile();

    const dispatch = useAppDispatch();
    const { products: taxiOptions, loading, error, initialized } = useAppSelector((state) => state.shopify);
    const { loading: checkoutLoading, error: checkoutError, checkoutUrl } = useAppSelector((state) => state.cart);

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

    // Fetch products from Shopify on mount
    useEffect(() => {
        if (!initialized) {
            dispatch(fetchTaxiProducts());
        }
    }, [dispatch, initialized]);

    // Redirect to Shopify checkout when URL is available
    useEffect(() => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

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

            // Create cart item
            const cartItem = {
                taxi: selectedTaxiData,
                search: searchDetails,
                totalPrice: totalPrice,
                quantity: 1,
            };

            // Create checkout directly (no customer info needed for guest checkout)
            dispatch(createCheckout({ item: cartItem }));
        }
    };

    const handleEditSearch = () => {
        navigate('/');
    };

    const handleRetry = () => {
        dispatch(fetchTaxiProducts());
    };

    // Selected taxi data for booking bar
    const selectedTaxiData = taxiOptions.find(t => t.id === selectedTaxi) || null;

    const distance = searchDetails.distance || 18.5;
    const duration = searchDetails.duration || "25 mins";

    // Loading state
    if (loading && !initialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Available Rides</h2>
                    <p className="text-gray-600">Please wait while we fetch the latest options...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={handleRetry}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No products state
    if (initialized && taxiOptions.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vehicles Available</h2>
                    <p className="text-gray-600 mb-6">We couldn't find any taxi options at the moment. Please try again later.</p>
                    <div className="space-y-3">
                        <button
                            onClick={handleRetry}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Refresh
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                                            {/* Checkout Error */}
                                            {checkoutError && (
                                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <p className="text-red-700 text-sm">{checkoutError}</p>
                                                </div>
                                            )}
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
                                                disabled={checkoutLoading}
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {checkoutLoading ? (
                                                    <>
                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                        <span>Processing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-5 w-5" />
                                                        <span>Proceed to Pay</span>
                                                    </>
                                                )}
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
                        {/* Checkout Error */}
                        {checkoutError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-xs">{checkoutError}</p>
                            </div>
                        )}

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
                                disabled={checkoutLoading}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkoutLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        <span>Proceed to Pay</span>
                                    </>
                                )}
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