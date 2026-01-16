import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, RefreshCw, AlertCircle, Lock, Users, Briefcase, Star, Clock } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTaxiProducts } from '../store/slices/shopifySlice';
import { createCheckout } from '../store/slices/cartSlice';
import type { SearchDetails } from '../types';

interface RentalDetails {
    serviceType: 'daily-rental';
    pickupLocation: string;
    pickupCoords: { lat: number; lng: number } | null;
    date: string;
    time: string;
    dropoffDate: string;
    dropoffTime: string;
    rentalHours: number;
    rentalDays: number;
    passengers: number;
}

const CarRentalOptions: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMobile();

    const dispatch = useAppDispatch();
    const { products: allProducts, loading, error, initialized } = useAppSelector((state) => state.shopify);
    const { loading: checkoutLoading, error: checkoutError, checkoutUrl } = useAppSelector((state) => state.cart);

    const [rentalDetails, setRentalDetails] = useState<RentalDetails>({
        serviceType: 'daily-rental',
        pickupLocation: 'Dubai',
        pickupCoords: { lat: 25.2048, lng: 55.2708 },
        date: new Date().toLocaleDateString(),
        time: '10:00 AM',
        dropoffDate: new Date().toLocaleDateString(),
        dropoffTime: '06:00 PM',
        rentalHours: 8,
        rentalDays: 1,
        passengers: 1
    });

    const [selectedCar, setSelectedCar] = useState<number | null>(null); 
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'passengers'>('price');

    // Helper function to convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (hours === 12) {
            hours = 0;
        }

        if (modifier === 'PM') {
            hours += 12;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Helper function to parse date string
    const parseDate = (dateString: string): Date => {
        if (dateString.includes('/')) {
            const [month, day, year] = dateString.split('/').map(Number);
            return new Date(year, month - 1, day);
        } else {
            return new Date(dateString);
        }
    };

    // Calculate rental hours
    const calculateRentalHours = (pickupDate: Date, pickupTime: string, dropoffDate: Date, dropoffTime: string) => {
        const pickupDateTime = new Date(pickupDate);
        const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
        pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0);

        const dropoffDateTime = new Date(dropoffDate);
        const [dropoffHour, dropoffMinute] = dropoffTime.split(':').map(Number);
        dropoffDateTime.setHours(dropoffHour, dropoffMinute, 0, 0);

        const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        return Math.max(0, diffHours);
    };

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

    // Update rental details from homepage
    useEffect(() => {
        if (location.state) {
            const state = location.state as RentalDetails;
            setRentalDetails(state);
        }
    }, [location]);

    // Filter products to only show those with "Daily Rental" variants
    const dailyRentalProducts = allProducts.filter(product => {
        return product.variants?.some(variant =>
            variant.title.toLowerCase().includes('daily rental')
        );
    }).map(product => {
        // Find half day and full day variants
        const halfDayVariant = product.variants?.find(variant => {
            const title = variant.title.toLowerCase();
            return (title.includes('half day') || title.includes('half-day')) &&
                title.includes('daily rental');
        });

        const fullDayVariant = product.variants?.find(variant => {
            const title = variant.title.toLowerCase();
            return (title.includes('full day') || title.includes('full-day')) &&
                title.includes('daily rental');
        });

        // Helper to extract price from variant
        const getVariantPrice = (variant: any): number => {
            if (!variant) return 0;
            if (typeof variant.price === 'object' && variant.price) {
                return parseFloat(variant.price.amount || '0');
            } else if (typeof variant.price === 'string') {
                return parseFloat(variant.price);
            } else if (typeof variant.price === 'number') {
                return variant.price;
            }
            return 0;
        };

        const halfDayPrice = getVariantPrice(halfDayVariant);
        const fullDayPrice = getVariantPrice(fullDayVariant);

        // Determine pricing based on rental hours
        let selectedVariant = null;
        let displayPrice = 0;
        let rentalType = '';
        let quantity = 1;

        const hours = rentalDetails.rentalHours;

        if (hours <= 5) {
            // Half day: ≤5 hours
            rentalType = 'Half Day';
            selectedVariant = halfDayVariant;
            displayPrice = halfDayPrice || (fullDayPrice / 2);
            quantity = 1;
        } else if (hours > 5 && hours < 24) {
            // Full day: >5 hours and <24 hours
            rentalType = 'Full Day';
            selectedVariant = fullDayVariant;
            displayPrice = fullDayPrice;
            quantity = 1;
        } else {
            // Multi-day: ≥24 hours
            // Calculate number of days (rounded up)
            const numberOfDays = Math.ceil(hours / 24);
            rentalType = `${numberOfDays} Day${numberOfDays > 1 ? 's' : ''}`;
            selectedVariant = fullDayVariant;
            displayPrice = fullDayPrice * numberOfDays;
            quantity = numberOfDays;
        }

        return {
            ...product,
            shopifyId: selectedVariant?.id || product.shopifyId,
            selectedVariant: selectedVariant,
            displayPrice: displayPrice,
            rentalType: rentalType,
            quantity: quantity,
            pricePerDay: quantity > 1 ? fullDayPrice : displayPrice
        };
    });

    // Filter by passenger capacity
    const filteredProducts = dailyRentalProducts.filter(car =>
        car.passengers >= rentalDetails.passengers
    );

    // Apply filters and sorting
    const filteredAndSortedCars = [...filteredProducts]
        .filter(car => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'popular') return car.popular;
            if (activeFilter === 'economy') return (car.displayPrice || 0) <= 400 * (car.quantity || 1);
            if (activeFilter === 'premium') return (car.displayPrice || 0) > 600 * (car.quantity || 1);
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price') {
                return (a.displayPrice || 0) - (b.displayPrice || 0);
            } else if (sortBy === 'rating') {
                return b.rating - a.rating;
            } else {
                return b.passengers - a.passengers;
            }
        });

    // Get rental type description
    const getRentalTypeDescription = () => {
        const hours = rentalDetails.rentalHours;

        if (hours <= 5) {
            return 'Half Day Rental';
        } else if (hours > 5 && hours < 24) {
            return 'Full Day Rental';
        } else {
            const days = Math.ceil(hours / 24);
            return `${days} Day${days > 1 ? 's' : ''} Rental`;
        }
    };

    const handleBookNow = (carId: number) => {
        // Toggle selection - if clicking the same car, unselect it
        if (selectedCar === carId) {
            setSelectedCar(null);
        } else {
            setSelectedCar(carId);
        }
    };

    const handleProceedToPay = () => {
        const selectedCarData = filteredAndSortedCars.find(car => car.id === selectedCar);
        if (selectedCarData) {
            const pickupTime24 = convertTo24Hour(rentalDetails.time);
            const dropoffTime24 = convertTo24Hour(rentalDetails.dropoffTime);

            const pickupDate = parseDate(rentalDetails.date);
            const dropoffDate = parseDate(rentalDetails.dropoffDate);

            const calculatedHours = calculateRentalHours(pickupDate, pickupTime24, dropoffDate, dropoffTime24);

            const searchDetails: SearchDetails = {
                serviceType: 'daily-rental', // Add this so cart service knows it's a daily rental
                from: rentalDetails.pickupLocation,
                to: rentalDetails.pickupLocation,
                fromCoords: rentalDetails.pickupCoords || undefined,
                toCoords: rentalDetails.pickupCoords || undefined,
                distance: 0,
                duration: `${calculatedHours.toFixed(1)} hours`,
                date: rentalDetails.date,
                time: rentalDetails.time,
                passengers: rentalDetails.passengers,
                pickupDate: rentalDetails.date,
                pickupTime: rentalDetails.time,
                dropoffDate: rentalDetails.dropoffDate,
                dropoffTime: rentalDetails.dropoffTime,
                rentalType: getRentalTypeDescription(),
                numberOfDays: selectedCarData.quantity || 1,
                rentalHours: calculatedHours
            };

            // Important: Use the selected variant's shopifyId and the calculated quantity
            // This way Shopify will multiply the variant price by the quantity
            const cartItem = {
                taxi: {
                    ...selectedCarData,
                    // Make sure we're using the correct variant ID for checkout
                    shopifyId: selectedCarData.selectedVariant?.id || selectedCarData.shopifyId,
                },
                search: searchDetails,
                totalPrice: selectedCarData.displayPrice || 0,
                quantity: selectedCarData.quantity || 1, // This is the key - Shopify will multiply
            };

            console.log('Cart Item being sent:', cartItem);

            dispatch(createCheckout({ item: cartItem }));
        }
    };

    const handleEditSearch = () => {
        navigate('/');
    };

    const handleRetry = () => {
        dispatch(fetchTaxiProducts());
    };

    const selectedCarData = filteredAndSortedCars.find(c => c.id === selectedCar) || null;

    // Loading state
    if (loading && !initialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Available Cars</h2>
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
    if (initialized && filteredAndSortedCars.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cars Available for Daily Rental</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't find any cars available for daily rental that can accommodate {rentalDetails.passengers} passenger{rentalDetails.passengers > 1 ? 's' : ''}.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                        Change Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-24">
            {/* Fixed Header */}
            <div className="bg-white shadow-lg sticky top-16 z-40 border-b border-gray-200">
                <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <Calendar className="h-4 w-4 text-orange-600" />
                                </div>
                                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    Daily Rental - {getRentalTypeDescription()}
                                </h1>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{rentalDetails.pickupLocation}</span>
                                </div>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span>{rentalDetails.rentalHours.toFixed(1)} hours</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleEditSearch}
                            className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Available Cars <span className="text-orange-600">({filteredAndSortedCars.length})</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                        <p>
                            Professional driver included • {rentalDetails.passengers} passenger{rentalDetails.passengers > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm bg-blue-50 px-3 py-1 rounded-full font-medium">
                                {rentalDetails.date} • {rentalDetails.time}
                            </span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm bg-green-50 px-3 py-1 rounded-full font-medium">
                                {rentalDetails.dropoffDate} • {rentalDetails.dropoffTime}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 flex justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 ">
                        {['all'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeFilter === filter
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'passengers')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="price">Price: Low to High</option>
                        <option value="rating">Rating: High to Low</option>
                        <option value="passengers">Capacity: High to Low</option>
                    </select>
                </div>

                {/* Rental Info Banner */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">{getRentalTypeDescription()}</h3>
                            <p className="text-sm text-gray-600">
                                {rentalDetails.rentalHours <= 5 ? (
                                    'Up to 5 hours rental'
                                ) : rentalDetails.rentalHours < 24 ? (
                                    'More than 5 hours, less than 24 hours'
                                ) : (
                                    `${Math.ceil(rentalDetails.rentalHours / 24)} day${Math.ceil(rentalDetails.rentalHours / 24) > 1 ? 's' : ''} (≥24 hours)`
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Total Duration</p>
                            <p className="text-lg font-bold text-blue-600">
                                {rentalDetails.rentalHours.toFixed(1)} hours
                            </p>
                            {rentalDetails.rentalHours >= 24 && (
                                <p className="text-xs text-blue-600 font-medium">
                                    ({Math.ceil(rentalDetails.rentalHours / 24)} days)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cars Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAndSortedCars.map((car) => (
                        <div
                            key={car.id}
                            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${selectedCar === car.id
                                ? 'border-green-500 shadow-xl shadow-green-500/20'
                                : 'border-gray-100 hover:border-orange-300'
                                }`}
                        // onClick={() => setSelectedCar(car.id)}
                        >
                            {/* Car Image */}
                            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover"
                                />
                                {car.popular && (
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        Popular
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-lg">
                                    {car.type}
                                </div>
                            </div>

                            {/* Car Details */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{car.name}</h3>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                                        <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                                        <span className="text-xs font-bold text-orange-600">{car.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{car.reviews} reviews</span>
                                </div>

                                {/* Specs */}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-gray-700">{car.passengers} Passengers</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-purple-600" />
                                        <span className="text-xs font-semibold text-gray-700">{car.luggage} Bags</span>
                                    </div>
                                </div>

                                {/* Driver Badge */}
                                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl py-2 px-3 mb-3">
                                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs font-bold text-orange-700">Professional Driver Included</span>
                                </div>

                                {/* Rental Type Badge */}
                                <div className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 mb-3 ${rentalDetails.rentalHours <= 5
                                    ? 'bg-green-50 border border-green-200'
                                    : rentalDetails.rentalHours < 24
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-purple-50 border border-purple-200'
                                    }`}>
                                    <Clock className={`h-4 w-4 ${rentalDetails.rentalHours <= 5
                                        ? 'text-green-600'
                                        : rentalDetails.rentalHours < 24
                                            ? 'text-blue-600'
                                            : 'text-purple-600'
                                        }`} />
                                    <span className={`text-xs font-bold ${rentalDetails.rentalHours <= 5
                                        ? 'text-green-700'
                                        : rentalDetails.rentalHours < 24
                                            ? 'text-blue-700'
                                            : 'text-purple-700'
                                        }`}>
                                        {car.rentalType}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            {rentalDetails.rentalHours <= 5 ? 'Half Day Rate'
                                                : rentalDetails.rentalHours < 24 ? 'Full Day Rate'
                                                    : `Total for ${car.quantity} Day${car.quantity > 1 ? 's' : ''}`}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            AED {Math.round(car.displayPrice)}
                                        </p>
                                        {rentalDetails.rentalHours >= 24 && car.quantity > 1 && (
                                            <p className="text-xs text-gray-500">
                                                AED {Math.round(car.pricePerDay || 0)} × {car.quantity} day{car.quantity > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookNow(car.id);
                                        }}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCar === car.id
                                            ? 'bg-green-300 text-gray-700 hover:bg-green-300 '
                                            : 'bg-orange-500 text-white shadow-lg'
                                            }`}
                                    >
                                        {selectedCar === car.id ? 'Selected' : 'Book'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Booking Bar */}
            {isMobile && selectedCarData && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 animate-slideUp">
                    <div className="container mx-auto px-4 py-3">
                        {checkoutError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-xs">{checkoutError}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Selected Car</p>
                                <p className="font-bold text-gray-900 truncate text-sm">{selectedCarData.name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-orange-600">AED {Math.round(selectedCarData.displayPrice)}</span>
                                    </p>
                                    <span className="text-xs text-gray-400">•</span>
                                    <p className="text-xs text-gray-500">{selectedCarData.rentalType}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleProceedToPay}
                                disabled={checkoutLoading}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 text-sm"
                            >
                                {checkoutLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        <span>Book Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Booking Summary */}
            {!isMobile && selectedCarData && (
                <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl border-2 border-orange-500 z-50 max-w-md overflow-hidden animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Booking Summary</h3>
                            <button
                                onClick={() => setSelectedCar(null)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                title="Close"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {checkoutError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{checkoutError}</p>
                            </div>
                        )}

                        {/* Vehicle Info */}
                        <div className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <img src={selectedCarData.image} alt={selectedCarData.name} className="w-20 h-12 object-contain rounded-lg" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{selectedCarData.name}</p>
                                    <p className="text-xs text-gray-500">{selectedCarData.type}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                                        <span className="text-xs font-semibold text-gray-700">{selectedCarData.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">Rental Type</span>
                                <span className="text-sm font-bold text-blue-600">{getRentalTypeDescription()}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Duration</span>
                                    <span className="font-semibold text-gray-900">{rentalDetails.rentalHours.toFixed(1)} hours</span>
                                </div>
                                {rentalDetails.rentalHours >= 24 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Days (Quantity)</span>
                                        <span className="font-semibold text-gray-900">{selectedCarData.quantity || 1} day{(selectedCarData.quantity || 1) > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Pickup</p>
                                    <p className="font-semibold text-gray-900">{rentalDetails.date}</p>
                                    <p className="text-sm text-gray-600">{rentalDetails.time}</p>
                                </div>
                            </div>
                            <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4"></div>
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Dropoff</p>
                                    <p className="font-semibold text-gray-900">{rentalDetails.dropoffDate}</p>
                                    <p className="text-sm text-gray-600">{rentalDetails.dropoffTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t-2 border-gray-200 pt-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{selectedCarData.rentalType}</span>
                                    <span className="font-semibold text-gray-900">AED {Math.round(selectedCarData.displayPrice)}</span>
                                </div>
                                {rentalDetails.rentalHours >= 24 && selectedCarData.quantity > 1 && (
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Price calculation</span>
                                        <span>AED {Math.round(selectedCarData.pricePerDay || 0)} × {selectedCarData.quantity} days</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-orange-600">AED {Math.round(selectedCarData.displayPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Book Now Button */}
                        <button
                            onClick={handleProceedToPay}
                            disabled={checkoutLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checkoutLoading ? (
                                <>
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-5 w-5" />
                                    <span>Proceed to Payment</span>
                                </>
                            )}
                        </button>

                        {/* Trust Badges */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    <span>Secure Payment</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Instant Confirmation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
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

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CarRentalOptions;