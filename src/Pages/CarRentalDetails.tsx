import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Clock, Users, Briefcase, Star,
    ArrowLeft, Lock, RefreshCw, AlertCircle, CheckCircle, Locate
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTaxiProducts } from '../store/slices/shopifySlice';
import { createCheckout } from '../store/slices/cartSlice';

interface RentalDetails {
    pickupLocation: string;
    pickupCoords: { lat: number; lng: number } | null;
    pickupDate: Date;
    pickupTime: string;
    dropoffDate: Date;
    dropoffTime: string;
    numberOfDays: number;
}

// Declare Google Maps types
declare global {
    interface Window {
        google: any;
    }
}

const CarRentalDetails: React.FC = () => {
    const { carId } = useParams<{ carId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { products, loading, initialized } = useAppSelector((state) => state.shopify);
    const { loading: checkoutLoading, error: checkoutError, checkoutUrl } = useAppSelector((state) => state.cart);

    // Refs for Google Maps Autocomplete
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const pickupAutocompleteRef = useRef<any>(null);

    const [rentalDetails, setRentalDetails] = useState<RentalDetails>({
        pickupLocation: '',
        pickupCoords: null,
        pickupDate: new Date(),
        pickupTime: '09:00',
        dropoffDate: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        })(),
        dropoffTime: '09:00',
        numberOfDays: 1,
    });

    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Date picker states
    const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
    const [showDropoffDatePicker, setShowDropoffDatePicker] = useState(false);
    const [currentPickupMonth, setCurrentPickupMonth] = useState(new Date());
    const [currentDropoffMonth, setCurrentDropoffMonth] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Generate time slots (every 15 minutes)
    const generateTimeSlots = () => {
        const times: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const h = hour.toString().padStart(2, '0');
                const m = minute.toString().padStart(2, '0');
                times.push(`${h}:${m}`);
            }
        }
        return times;
    };

    const formatTime12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const timeSlots = generateTimeSlots();

    // Fetch products if not initialized
    useEffect(() => {
        if (!initialized) {
            dispatch(fetchTaxiProducts());
        }
    }, [dispatch, initialized]);

    // Initialize Google Maps Places Autocomplete
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            const existingScript = document.getElementById('google-maps-script');

            if (!existingScript) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                const googleMapAPIKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

                script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapAPIKey}&libraries=places,geocoding`;
                script.async = true;
                script.defer = true;
                script.onload = initAutocomplete;
                document.head.appendChild(script);
            } else if (window.google) {
                initAutocomplete();
            }
        };

        const initAutocomplete = () => {
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                return;
            }

            // Initialize pickup autocomplete
            if (pickupInputRef.current && !pickupAutocompleteRef.current) {
                pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    pickupInputRef.current,
                    {
                        types: ['geocode', 'establishment'],
                        componentRestrictions: { country: 'ae' }
                    }
                );

                pickupAutocompleteRef.current.addListener('place_changed', () => {
                    const place = pickupAutocompleteRef.current.getPlace();
                    if (place.formatted_address && place.geometry) {
                        const address = place.formatted_address;
                        const coords = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        };

                        setRentalDetails(prev => ({
                            ...prev,
                            pickupLocation: address,
                            pickupCoords: coords
                        }));
                    }
                });
            }
        };

        loadGoogleMapsScript();
    }, []);

    // Get current location using Geolocation API
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Use Google Geocoding API to get address from coordinates
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}`
                    );

                    const data = await response.json();

                    if (data.results && data.results[0]) {
                        const address = data.results[0].formatted_address;
                        const coords = { lat: latitude, lng: longitude };

                        setRentalDetails(prev => ({
                            ...prev,
                            pickupLocation: address,
                            pickupCoords: coords
                        }));

                        // Update autocomplete input
                        if (pickupInputRef.current) {
                            pickupInputRef.current.value = address;
                        }
                    }
                } catch (error) {
                    console.error('Error getting address from coordinates:', error);
                    const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
                    const coords = { lat: latitude, lng: longitude };

                    setRentalDetails(prev => ({
                        ...prev,
                        pickupLocation: fallbackAddress,
                        pickupCoords: coords
                    }));
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                console.error('Error getting current location:', error);
                setIsGettingLocation(false);

                let errorMessage = 'Unable to get your current location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access was denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Redirect to checkout when URL is available
    useEffect(() => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

    // Calculate number of days when dates change
    useEffect(() => {
        if (rentalDetails.pickupDate && rentalDetails.dropoffDate) {
            const pickup = new Date(rentalDetails.pickupDate);
            const dropoff = new Date(rentalDetails.dropoffDate);
            const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setRentalDetails(prev => ({ ...prev, numberOfDays: diffDays || 1 }));
        }
    }, [rentalDetails.pickupDate, rentalDetails.dropoffDate]);

    // Calendar generation
    const generateCalendar = (currentMonthDate: Date) => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isBeforePickup = (date: Date) => {
        return date < rentalDetails.pickupDate;
    };

    const isDateSelected = (date: Date, type: 'pickup' | 'dropoff') => {
        if (!date) return false;
        if (type === 'pickup') {
            return date.toDateString() === rentalDetails.pickupDate.toDateString();
        } else {
            return date.toDateString() === rentalDetails.dropoffDate.toDateString();
        }
    };

    const handlePickupDateClick = (date: Date) => {
        setRentalDetails(prev => ({ ...prev, pickupDate: date }));
        setShowPickupDatePicker(false);
    };

    const handleDropoffDateClick = (date: Date) => {
        setRentalDetails(prev => ({ ...prev, dropoffDate: date }));
        setShowDropoffDatePicker(false);
    };

    const formatDate = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Find the selected car
    const selectedCar = products.find(car => car.id === Number(carId));

    // Calculate daily rate (using baseFare as daily rate)
    const dailyRate = selectedCar?.baseFare || 0;
    const totalPrice = dailyRate * rentalDetails.numberOfDays;

    const isFormValid = () => {
        return (
            rentalDetails.pickupLocation.trim() !== '' &&
            rentalDetails.pickupDate &&
            rentalDetails.dropoffDate &&
            rentalDetails.pickupTime !== '' &&
            rentalDetails.dropoffTime !== '' &&
            rentalDetails.numberOfDays > 0
        );
    };

    const handleCheckout = () => {
        if (!isFormValid()) {
            alert('Please fill in all required fields');
            return;
        }

        if (!selectedCar) {
            alert('Car not found');
            return;
        }

        // Create cart item for rental
        const cartItem = {
            taxi: selectedCar,
            search: {
                from: rentalDetails.pickupLocation,
                to: rentalDetails.pickupLocation,
                fromCoords: rentalDetails.pickupCoords || undefined,
                toCoords: rentalDetails.pickupCoords || undefined,
                distance: 0,
                duration: `${rentalDetails.numberOfDays} days`,
                date: formatDate(rentalDetails.pickupDate),
                time: formatTime12Hour(rentalDetails.pickupTime),
                passengers: 1,
                pickupDate: formatDate(rentalDetails.pickupDate),
                pickupTime: formatTime12Hour(rentalDetails.pickupTime),
                dropoffDate: formatDate(rentalDetails.dropoffDate),
                dropoffTime: formatTime12Hour(rentalDetails.dropoffTime),
                rentalType: 'daily',
            },
            totalPrice: totalPrice,
            quantity: rentalDetails.numberOfDays,
        };

        dispatch(createCheckout({ item: cartItem }));
    };

    const pickupCalendarDays = generateCalendar(currentPickupMonth);
    const dropoffCalendarDays = generateCalendar(currentDropoffMonth);

    // Loading state
    if (loading && !initialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-16">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Vehicle Details</h2>
                    <p className="text-gray-600">Please wait...</p>
                </div>
            </div>
        );
    }

    // Car not found
    if (!selectedCar && initialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-16 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
                    <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or is no longer available.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-12">
            <div className="container mx-auto px-4 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Fleet
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Car Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Car Image & Info Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Car Image */}
                            <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200">
                                <img
                                    src={selectedCar?.image}
                                    alt={selectedCar?.name}
                                    className="w-full h-full object-cover"
                                />
                                {selectedCar?.popular && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        Popular Choice
                                    </div>
                                )}
                            </div>

                            {/* Car Info */}
                            <div className="p-6 lg:p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCar?.name}</h1>
                                        <p className="text-lg text-gray-600">{selectedCar?.type}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                                        <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                                        <span className="text-lg font-bold text-orange-600">{selectedCar?.rating}</span>
                                        <span className="text-sm text-gray-500">({selectedCar?.reviews})</span>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Passengers</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedCar?.passengers}</p>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <Briefcase className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Luggage</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedCar?.luggage} Bags</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Features & Amenities</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Air Conditioning', 'Automatic', 'GPS Navigation', 'Bluetooth', 'USB Charging', 'Child Seat Available'].map((feature) => (
                                            <div key={feature} className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Details</h2>

                            <div className="space-y-5">
                                {/* Pickup Location with Google Autocomplete */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                            <div className="p-1.5 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-200">
                                                <MapPin className="h-4 w-4 text-orange-600" />
                                            </div>
                                            Pickup Location <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <input
                                                ref={pickupInputRef}
                                                type="text"
                                                placeholder="Enter pickup location"
                                                value={rentalDetails.pickupLocation}
                                                onChange={(e) => setRentalDetails(prev => ({ ...prev, pickupLocation: e.target.value }))}
                                                required
                                                className="relative w-full py-4 pl-12 pr-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-base text-gray-700 placeholder-gray-400 transition-all duration-200"
                                            />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />

                                            {/* Current Location Button */}
                                            <button
                                                type="button"
                                                onClick={getCurrentLocation}
                                                disabled={isGettingLocation}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Use current location"
                                            >
                                                {isGettingLocation ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                                ) : (
                                                    <Locate className="h-4 w-4 text-gray-500 hover:text-orange-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Date & Time */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Pickup Date Selection */}
                                    <div className="group relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-200">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                </div>
                                                Pickup Date
                                            </label>
                                        </div>
                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                            <button
                                                type="button"
                                                onClick={() => setShowPickupDatePicker(!showPickupDatePicker)}
                                                className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                            >
                                                <div className="text-gray-700 font-medium text-sm">
                                                    {rentalDetails.pickupDate.getDate()}/{rentalDetails.pickupDate.getMonth() + 1}/{rentalDetails.pickupDate.getFullYear().toString().slice(-2)}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Date Picker Dropdown */}
                                        {showPickupDatePicker && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-slideDown min-w-[300px]">
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPickupMonth(new Date(currentPickupMonth.getFullYear(), currentPickupMonth.getMonth() - 1, 1))}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>

                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {monthNames[currentPickupMonth.getMonth()]} {currentPickupMonth.getFullYear()}
                                                        </h3>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPickupMonth(new Date(currentPickupMonth.getFullYear(), currentPickupMonth.getMonth() + 1, 1))}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-2 mb-2">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                        <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-2">
                                                    {pickupCalendarDays.map((date, index) => {
                                                        if (!date) {
                                                            return <div key={`empty-${index}`} className="aspect-square" />;
                                                        }

                                                        const isToday = date.toDateString() === new Date().toDateString();
                                                        const isPast = isPastDate(date);
                                                        const isSelected = isDateSelected(date, 'pickup');

                                                        return (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => !isPast && handlePickupDateClick(date)}
                                                                disabled={isPast}
                                                                className={`
                                                                    aspect-square rounded-lg text-sm font-medium transition-all duration-200
                                                                    ${isPast
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'hover:bg-purple-50 cursor-pointer'
                                                                    }
                                                                    ${isSelected
                                                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                                                                        : 'text-gray-700'
                                                                    }
                                                                    ${isToday && !isSelected ? 'border-2 border-purple-500' : ''}
                                                                `}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handlePickupDateClick(new Date());
                                                            setCurrentPickupMonth(new Date());
                                                        }}
                                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                                    >
                                                        Today
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPickupDatePicker(false)}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pickup Time */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Pickup Time
                                            </label>
                                        </div>
                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                            <select
                                                value={rentalDetails.pickupTime}
                                                onChange={(e) => setRentalDetails(prev => ({ ...prev, pickupTime: e.target.value }))}
                                                className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-700 text-sm transition-all duration-200 appearance-none cursor-pointer font-medium"
                                            >
                                                {timeSlots.map((time) => (
                                                    <option key={time} value={time}>
                                                        {formatTime12Hour(time)}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropoff Date & Time */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Dropoff Date Selection */}
                                    <div className="group relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-200">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                </div>
                                                Dropoff Date
                                            </label>
                                        </div>
                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                            <button
                                                type="button"
                                                onClick={() => setShowDropoffDatePicker(!showDropoffDatePicker)}
                                                className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                            >
                                                <div className="text-gray-700 font-medium text-sm">
                                                    {rentalDetails.dropoffDate.getDate()}/{rentalDetails.dropoffDate.getMonth() + 1}/{rentalDetails.dropoffDate.getFullYear().toString().slice(-2)}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Date Picker Dropdown */}
                                        {showDropoffDatePicker && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-slideDown min-w-[300px]">
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentDropoffMonth(new Date(currentDropoffMonth.getFullYear(), currentDropoffMonth.getMonth() - 1, 1))}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>

                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {monthNames[currentDropoffMonth.getMonth()]} {currentDropoffMonth.getFullYear()}
                                                        </h3>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentDropoffMonth(new Date(currentDropoffMonth.getFullYear(), currentDropoffMonth.getMonth() + 1, 1))}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-2 mb-2">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                        <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-2">
                                                    {dropoffCalendarDays.map((date, index) => {
                                                        if (!date) {
                                                            return <div key={`empty-${index}`} className="aspect-square" />;
                                                        }

                                                        const isToday = date.toDateString() === new Date().toDateString();
                                                        const isPast = isPastDate(date);
                                                        const isBefore = isBeforePickup(date);
                                                        const isSelected = isDateSelected(date, 'dropoff');

                                                        return (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => !isPast && !isBefore && handleDropoffDateClick(date)}
                                                                disabled={isPast || isBefore}
                                                                className={`
                                                                    aspect-square rounded-lg text-sm font-medium transition-all duration-200
                                                                    ${isPast || isBefore
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'hover:bg-purple-50 cursor-pointer'
                                                                    }
                                                                    ${isSelected
                                                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                                                                        : 'text-gray-700'
                                                                    }
                                                                    ${isToday && !isSelected ? 'border-2 border-purple-500' : ''}
                                                                `}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const tomorrow = new Date(rentalDetails.pickupDate);
                                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                                            handleDropoffDateClick(tomorrow);
                                                            setCurrentDropoffMonth(tomorrow);
                                                        }}
                                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                                    >
                                                        Next Day
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDropoffDatePicker(false)}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropoff Time */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Dropoff Time
                                            </label>
                                        </div>
                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                            <select
                                                value={rentalDetails.dropoffTime}
                                                onChange={(e) => setRentalDetails(prev => ({ ...prev, dropoffTime: e.target.value }))}
                                                className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-700 text-sm transition-all duration-200 appearance-none cursor-pointer font-medium"
                                            >
                                                {timeSlots.map((time) => (
                                                    <option key={time} value={time}>
                                                        {formatTime12Hour(time)}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Number of Days Display */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Rental Duration</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {rentalDetails.numberOfDays} {rentalDetails.numberOfDays === 1 ? 'Day' : 'Days'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                                <h3 className="text-xl font-bold mb-1">Booking Summary</h3>
                                <p className="text-sm text-orange-100">Daily Rental</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Checkout Error */}
                                {checkoutError && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-700 text-sm">{checkoutError}</p>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Daily Rate</span>
                                        <span className="font-semibold text-gray-900">AED {dailyRate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Number of Days</span>
                                        <span className="font-semibold text-gray-900">{rentalDetails.numberOfDays}</span>
                                    </div>
                                    <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-orange-600">AED {totalPrice}</span>
                                    </div>
                                </div>

                                {/* Rental Summary */}
                                {rentalDetails.pickupLocation && rentalDetails.pickupDate && (
                                    <div className="border-t-2 border-gray-200 pt-4 space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Pickup</p>
                                            <p className="font-semibold text-gray-900">{rentalDetails.pickupLocation}</p>
                                            <p className="text-gray-600">{formatDate(rentalDetails.pickupDate)} at {formatTime12Hour(rentalDetails.pickupTime)}</p>
                                        </div>
                                        {rentalDetails.dropoffDate && (
                                            <div>
                                                <p className="text-gray-500 text-xs mb-1">Dropoff</p>
                                                <p className="font-semibold text-gray-900">{rentalDetails.pickupLocation}</p>
                                                <p className="text-gray-600">{formatDate(rentalDetails.dropoffDate)} at {formatTime12Hour(rentalDetails.dropoffTime)}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={!isFormValid() || checkoutLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5" />
                                            <span>Proceed to Checkout</span>
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    By proceeding, you agree to our terms and conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styling */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }

                /* Google Places autocomplete styling */
                .pac-container {
                    border-radius: 12px;
                    margin-top: 4px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    z-index: 9999;
                }

                .pac-item {
                    padding: 12px 16px;
                    cursor: pointer;
                    border-top: 1px solid #f3f4f6;
                }

                .pac-item:hover {
                    background-color: #f9fafb;
                }

                .pac-item-query {
                    font-size: 14px;
                    color: #111827;
                }
            `}</style>
        </div>
    );
};

export default CarRentalDetails;