import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Navigation, Clock, Users, ArrowRightLeft, Locate, Car, History } from 'lucide-react';
import Banner5 from '../assets/Banner7.png';

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

interface PlaceDetails {
    address: string;
    lat: number;
    lng: number;
}

type TripType = 'one-way' | 'return';
type ServiceType = 'transfers' | 'daily-rental';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // Service Type State
    const [serviceType, setServiceType] = useState<ServiceType>('transfers');

    // Common States
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupDetails, setPickupDetails] = useState<PlaceDetails | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState('10:00');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [numberOfPersons, setNumberOfPersons] = useState(1);
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState<{
        pickup: boolean;
        dropoff: boolean;
    }>({ pickup: false, dropoff: false });

    // Transfer-specific States
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [dropoffDetails, setDropoffDetails] = useState<PlaceDetails | null>(null);
    const [tripType, setTripType] = useState<TripType>('one-way');
    const [returnDate, setReturnDate] = useState<Date>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
    const [currentReturnMonth, setCurrentReturnMonth] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });
    const [distance, setDistance] = useState<number | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [returnTime, setReturnTime] = useState('18:00');

    // Daily Rental specific States
    const [dropoffDate, setDropoffDate] = useState<Date>(new Date());
    const [dropoffTime, setDropoffTime] = useState('20:00');
    const [showDropoffDatePicker, setShowDropoffDatePicker] = useState(false);
    const [currentDropoffMonth, setCurrentDropoffMonth] = useState(new Date());

    // Refs for Google Places Autocomplete
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropoffInputRef = useRef<HTMLInputElement>(null);
    const pickupAutocompleteRef = useRef<any>(null);
    const dropoffAutocompleteRef = useRef<any>(null);

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

    // Calculate rental hours for daily rental
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

    // Calculate rental days for multi-day rental
    const calculateRentalDays = (pickupDate: Date, dropoffDate: Date) => {
        // If same day, return 1
        if (pickupDate.toDateString() === dropoffDate.toDateString()) {
            return 1;
        }
        // Otherwise calculate difference in days
        const diffTime = Math.abs(dropoffDate.getTime() - pickupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
    };

    // Get current location using Geolocation API
    const getCurrentLocation = (type: 'pickup' | 'dropoff') => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingCurrentLocation(prev => ({ ...prev, [type]: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}`
                    );

                    const data = await response.json();

                    if (data.results && data.results[0]) {
                        const address = data.results[0].formatted_address;

                        if (type === 'pickup') {
                            setPickupLocation(address);
                            setPickupDetails({
                                address,
                                lat: latitude,
                                lng: longitude
                            });
                            if (pickupInputRef.current) {
                                pickupInputRef.current.value = address;
                            }
                        } else {
                            setDropoffLocation(address);
                            setDropoffDetails({
                                address,
                                lat: latitude,
                                lng: longitude
                            });
                            if (dropoffInputRef.current) {
                                dropoffInputRef.current.value = address;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error getting address from coordinates:', error);
                    const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

                    if (type === 'pickup') {
                        setPickupLocation(fallbackAddress);
                        setPickupDetails({
                            address: fallbackAddress,
                            lat: latitude,
                            lng: longitude
                        });
                    } else {
                        setDropoffLocation(fallbackAddress);
                        setDropoffDetails({
                            address: fallbackAddress,
                            lat: latitude,
                            lng: longitude
                        });
                    }
                } finally {
                    setIsGettingCurrentLocation(prev => ({ ...prev, [type]: false }));
                }
            },
            (error) => {
                console.error('Error getting current location:', error);
                setIsGettingCurrentLocation(prev => ({ ...prev, [type]: false }));

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

            // Clear existing autocomplete instances when switching service types
            if (pickupAutocompleteRef.current && pickupInputRef.current) {
                window.google.maps.event.clearInstanceListeners(pickupInputRef.current);
                pickupAutocompleteRef.current = null;
            }

            if (dropoffAutocompleteRef.current && dropoffInputRef.current) {
                window.google.maps.event.clearInstanceListeners(dropoffInputRef.current);
                dropoffAutocompleteRef.current = null;
            }

            // Initialize pickup autocomplete (always needed)
            if (pickupInputRef.current) {
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
                        setPickupLocation(place.formatted_address);
                        setPickupDetails({
                            address: place.formatted_address,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        });
                    }
                });
            }

            // Initialize dropoff autocomplete (only for transfers)
            if (serviceType === 'transfers' && dropoffInputRef.current) {
                dropoffAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    dropoffInputRef.current,
                    {
                        types: ['geocode', 'establishment'],
                        componentRestrictions: { country: 'ae' }
                    }
                );

                dropoffAutocompleteRef.current.addListener('place_changed', () => {
                    const place = dropoffAutocompleteRef.current.getPlace();
                    if (place.formatted_address && place.geometry) {
                        setDropoffLocation(place.formatted_address);
                        setDropoffDetails({
                            address: place.formatted_address,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        });
                    }
                });
            }
        };

        loadGoogleMapsScript();
    }, [serviceType]);

    // Calculate distance when both locations are selected (transfers only)
    useEffect(() => {
        if (serviceType === 'transfers' && pickupDetails && dropoffDetails && window.google) {
            calculateDistance();
        } else {
            setDistance(null);
            setDuration(null);
        }
    }, [pickupDetails, dropoffDetails, serviceType]);

    const calculateDistance = () => {
        if (!pickupDetails || !dropoffDetails || !window.google) return;

        setIsCalculating(true);

        const service = new window.google.maps.DistanceMatrixService();

        service.getDistanceMatrix(
            {
                origins: [{ lat: pickupDetails.lat, lng: pickupDetails.lng }],
                destinations: [{ lat: dropoffDetails.lat, lng: dropoffDetails.lng }],
                travelMode: 'DRIVING',
                unitSystem: window.google.maps.UnitSystem.METRIC,
            },
            (response: any, status: any) => {
                setIsCalculating(false);

                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const result = response.rows[0].elements[0];
                    const distanceInKm = result.distance.value / 1000;
                    setDistance(distanceInKm);
                    setDuration(result.duration.text);
                } else {
                    console.error('Distance calculation failed:', status);
                    setDistance(null);
                    setDuration(null);
                }
            }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (serviceType === 'transfers') {
            if (!pickupLocation || !dropoffLocation) {
                alert('Please select both pickup and dropoff locations');
                return;
            }

            navigate('/transport-options', {
                state: {
                    serviceType: 'transfers',
                    from: pickupLocation,
                    to: dropoffLocation,
                    tripType: tripType,
                    fromCoords: pickupDetails ? { lat: pickupDetails.lat, lng: pickupDetails.lng } : null,
                    toCoords: dropoffDetails ? { lat: dropoffDetails.lat, lng: dropoffDetails.lng } : null,
                    distance: distance,
                    duration: duration,
                    date: formatDate(selectedDate),
                    time: formatTime12Hour(selectedTime),
                    returnDate: tripType === 'return' ? formatDate(returnDate) : null,
                    returnTime: tripType === 'return' ? formatTime12Hour(returnTime) : null,
                    passengers: numberOfPersons
                }
            });
        } else {
            // Daily Rental
            if (!pickupLocation) {
                alert('Please select a pickup location');
                return;
            }

            // Validate that dropoff is after pickup
            const rentalHours = calculateRentalHours(selectedDate, selectedTime, dropoffDate, dropoffTime);

            if (rentalHours <= 0) {
                alert('Dropoff date and time must be after pickup date and time');
                return;
            }

            const rentalDays = calculateRentalDays(selectedDate, dropoffDate);

            navigate('/car-rental-options', {
                state: {
                    serviceType: 'daily-rental',
                    pickupLocation: pickupLocation,
                    pickupCoords: pickupDetails ? { lat: pickupDetails.lat, lng: pickupDetails.lng } : null,
                    date: formatDate(selectedDate),
                    time: formatTime12Hour(selectedTime),
                    dropoffDate: formatDate(dropoffDate),
                    dropoffTime: formatTime12Hour(dropoffTime),
                    rentalHours: rentalHours,
                    rentalDays: rentalDays,
                    passengers: numberOfPersons
                }
            });
        }
    };

    const formatDate = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const handleReturnDateClick = (date: Date) => {
        setReturnDate(date);
        setShowReturnDatePicker(false);
    };

    const handleDropoffDateClick = (date: Date) => {
        setDropoffDate(date);
        setShowDropoffDatePicker(false);
    };

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

    const isDateSelected = (date: Date, type: 'departure' | 'return' | 'dropoff') => {
        if (!date) return false;
        if (type === 'departure') {
            return date.toDateString() === selectedDate.toDateString();
        } else if (type === 'return') {
            return date.toDateString() === returnDate.toDateString();
        } else {
            return date.toDateString() === dropoffDate.toDateString();
        }
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isBeforeDeparture = (date: Date) => {
        return date < selectedDate;
    };

    const handleTripTypeChange = (type: TripType) => {
        setTripType(type);
        if (type === 'one-way' && returnDate < selectedDate) {
            const tomorrow = new Date(selectedDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setReturnDate(tomorrow);
        }
    };

    const departureCalendarDays = generateCalendar(currentMonth);
    const returnCalendarDays = generateCalendar(currentReturnMonth);
    const dropoffCalendarDays = generateCalendar(currentDropoffMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Calculate estimated rental info for daily rental
    const currentRentalHours = serviceType === 'daily-rental'
        ? calculateRentalHours(selectedDate, selectedTime, dropoffDate, dropoffTime)
        : 0;

    return (
        <div className="min-h-screen bg-white">
            {/* Banner Section with Background Image */}
            <div
                className="relative min-h-screen bg-cover bg-center bg-no-repeat mt-16"
                style={{
                    backgroundImage: `url(${Banner5})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/10 to-black/10"></div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-screen py-8 lg:py-12">
                        {/* Left Column - Booking Form */}
                        <div className="w-full mx-auto order-2 lg:order-1">
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/10 border border-white/30 max-w-lg lg:mx-0 mx-auto">
                                {/* Service Type Selector */}
                                <div className="mb-4 sm:mb-6">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setServiceType('transfers')}
                                            className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${serviceType === 'transfers'
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                                }`}
                                        >
                                            <Car className="h-4 w-4" />
                                            Transfers
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setServiceType('daily-rental')}
                                            className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${serviceType === 'daily-rental'
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                                }`}
                                        >
                                            <History className="h-4 w-4" />
                                            Daily Bookings
                                        </button>
                                    </div>

                                    <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-2">
                                        {serviceType === 'transfers' ? 'Reserve Your Ride Now' : 'Reserve a Car for the Day'}
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {serviceType === 'transfers'
                                            ? 'Experience luxury travel with professional drivers'
                                            : 'Choose from our premium fleet with driver included'
                                        }
                                    </p>
                                </div>

                                <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
                                    {/* Transfers Form */}
                                    {serviceType === 'transfers' && (
                                        <>
                                            {/* Trip Type Selection */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg border border-indigo-200">
                                                            <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                                                        </div>
                                                        Trip Type
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTripTypeChange('one-way')}
                                                        className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 font-medium text-sm transition-all duration-200 ${tripType === 'one-way'
                                                            ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        One Way
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTripTypeChange('return')}
                                                        className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 font-medium text-sm transition-all duration-200 ${tripType === 'return'
                                                            ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        Return
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pickup Location */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-200">
                                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                                                        </div>
                                                        Pickup Location
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <input
                                                            ref={pickupInputRef}
                                                            type="text"
                                                            placeholder="Enter pickup location"
                                                            value={pickupLocation}
                                                            onChange={(e) => setPickupLocation(e.target.value)}
                                                            required
                                                            className="relative w-full py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-sm sm:text-base text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                        />
                                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />

                                                        <button
                                                            type="button"
                                                            onClick={() => getCurrentLocation('pickup')}
                                                            disabled={isGettingCurrentLocation.pickup}
                                                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Use current location"
                                                        >
                                                            {isGettingCurrentLocation.pickup ? (
                                                                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-orange-600"></div>
                                                            ) : (
                                                                <Locate className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 hover:text-orange-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dropoff Location */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                                        </div>
                                                        Destination
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <input
                                                            ref={dropoffInputRef}
                                                            type="text"
                                                            placeholder="Enter destination"
                                                            value={dropoffLocation}
                                                            onChange={(e) => setDropoffLocation(e.target.value)}
                                                            required
                                                            className="relative w-full py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-sm sm:text-base text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                        />
                                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />

                                                        <button
                                                            type="button"
                                                            onClick={() => getCurrentLocation('dropoff')}
                                                            disabled={isGettingCurrentLocation.dropoff}
                                                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Use current location"
                                                        >
                                                            {isGettingCurrentLocation.dropoff ? (
                                                                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                                                            ) : (
                                                                <Locate className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 hover:text-blue-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Distance Display */}
                                            {distance !== null && (
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-200 animate-fadeIn">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                                                                <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] sm:text-xs text-green-600 font-semibold uppercase tracking-wide">Route Distance</p>
                                                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{distance.toFixed(1)} km</p>
                                                            </div>
                                                        </div>
                                                        {duration && (
                                                            <div className="text-right">
                                                                <p className="text-[10px] sm:text-xs text-green-600 font-semibold uppercase tracking-wide">Est. Time</p>
                                                                <p className="text-base sm:text-lg font-bold text-gray-900">{duration}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Calculating Indicator */}
                                            {isCalculating && (
                                                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-orange-600"></div>
                                                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Calculating distance...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Daily Rental Form */}
                                    {serviceType === 'daily-rental' && (
                                        <>
                                            {/* Pickup Location */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-200">
                                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                                                        </div>
                                                        Pickup Location
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <input
                                                            ref={pickupInputRef}
                                                            type="text"
                                                            placeholder="Enter pickup location"
                                                            value={pickupLocation}
                                                            onChange={(e) => setPickupLocation(e.target.value)}
                                                            required
                                                            className="relative w-full py-3 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-sm sm:text-base text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                        />
                                                        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />

                                                        <button
                                                            type="button"
                                                            onClick={() => getCurrentLocation('pickup')}
                                                            disabled={isGettingCurrentLocation.pickup}
                                                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Use current location"
                                                        >
                                                            {isGettingCurrentLocation.pickup ? (
                                                                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-orange-600"></div>
                                                            ) : (
                                                                <Locate className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 hover:text-orange-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rental Duration Info Banner */}
                                            {currentRentalHours > 0 && (
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Rental Duration</p>
                                                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                                                                {currentRentalHours.toFixed(1)} hours
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Type</p>
                                                            <p className="text-sm font-bold text-blue-700">
                                                                {currentRentalHours <= 5
                                                                    ? 'Half Day'
                                                                    : currentRentalHours < 24
                                                                        ? 'Full Day'
                                                                        : `${Math.ceil(currentRentalHours / 24)} Days`
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Pickup Date and Time Row - Common for both */}
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        {/* Pickup Date Selection */}
                                        <div className="group relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                    <div className="p-1 sm:p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-200">
                                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                                                    </div>
                                                    <span className="hidden sm:inline">Pickup Date</span>
                                                    <span className="sm:hidden">Pickup</span>
                                                </label>
                                            </div>
                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                                    className="relative w-full py-3 sm:py-4 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                                >
                                                    <div className="text-gray-700 font-medium text-xs sm:text-sm">
                                                        {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear().toString().slice(-2)}
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Date Picker Dropdown */}
                                            {showDatePicker && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 z-50 animate-slideDown min-w-[280px] sm:min-w-[300px]">
                                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>

                                                        <div className="text-center">
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                                            </h3>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
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
                                                        {departureCalendarDays.map((date, index) => {
                                                            if (!date) {
                                                                return <div key={`empty-${index}`} className="aspect-square" />;
                                                            }

                                                            const isToday = date.toDateString() === new Date().toDateString();
                                                            const isPast = isPastDate(date);
                                                            const isSelected = isDateSelected(date, 'departure');

                                                            return (
                                                                <button
                                                                    key={index}
                                                                    type="button"
                                                                    onClick={() => !isPast && handleDateClick(date)}
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
                                                                setSelectedDate(new Date());
                                                                setCurrentMonth(new Date());
                                                            }}
                                                            className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                                        >
                                                            Today
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDatePicker(false)}
                                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pickup Time Selection */}
                                        <div className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                    <div className="p-1 sm:p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                                    </div>
                                                    <span className="hidden sm:inline">Pickup Time</span>
                                                    <span className="sm:hidden">Time</span>
                                                </label>
                                            </div>
                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                <select
                                                    value={selectedTime}
                                                    onChange={(e) => setSelectedTime(e.target.value)}
                                                    className="relative w-full py-3 sm:py-4 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-700 text-xs sm:text-sm transition-all duration-200 appearance-none cursor-pointer font-medium"
                                                >
                                                    {timeSlots.map((time) => (
                                                        <option key={time} value={time}>
                                                            {formatTime12Hour(time)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropoff Date and Time Row - Only for Daily Rental */}
                                    {serviceType === 'daily-rental' && (
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            {/* Dropoff Date */}
                                            <div className="group relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-200">
                                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                        </div>
                                                        <span className="hidden sm:inline">Dropoff Date</span>
                                                        <span className="sm:hidden">Dropoff</span>
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDropoffDatePicker(!showDropoffDatePicker)}
                                                        className="relative w-full py-3 sm:py-4 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-green-500 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 cursor-pointer text-left"
                                                    >
                                                        <div className="text-gray-700 font-medium text-xs sm:text-sm">
                                                            {dropoffDate.getDate()}/{dropoffDate.getMonth() + 1}/{dropoffDate.getFullYear().toString().slice(-2)}
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Dropoff Date Picker Dropdown */}
                                                {showDropoffDatePicker && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 z-50 animate-slideDown min-w-[280px] sm:min-w-[300px]">
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
                                                                const isBefore = isBeforeDeparture(date);
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
                                                                                : 'hover:bg-green-50 cursor-pointer'
                                                                            }
                                                                    ${isSelected
                                                                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105'
                                                                                : 'text-gray-700'
                                                                            }
                                                                    ${isToday && !isSelected ? 'border-2 border-green-500' : ''}
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
                                                                    setDropoffDate(new Date(selectedDate));
                                                                    setCurrentDropoffMonth(new Date(selectedDate));
                                                                }}
                                                                className="text-sm text-green-600 hover:text-green-700 font-semibold"
                                                            >
                                                                Same Day
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowDropoffDatePicker(false)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dropoff Time Selection */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-200">
                                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                        </div>
                                                        <span className="hidden sm:inline">Dropoff Time</span>
                                                        <span className="sm:hidden">Time</span>
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <select
                                                        value={dropoffTime}
                                                        onChange={(e) => setDropoffTime(e.target.value)}
                                                        className="relative w-full py-3 sm:py-4 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-gray-700 text-xs sm:text-sm transition-all duration-200 appearance-none cursor-pointer font-medium"
                                                    >
                                                        {timeSlots.map((time) => (
                                                            <option key={time} value={time}>
                                                                {formatTime12Hour(time)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Return Date and Time - Only for transfers return trips */}
                                    {serviceType === 'transfers' && tripType === 'return' && (
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            {/* Return Date */}
                                            <div className="group relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                        <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-200">
                                                            <Calendar className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        Return Date
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowReturnDatePicker(!showReturnDatePicker)}
                                                        className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                                    >
                                                        <div className="text-gray-700 font-medium text-sm">
                                                            {returnDate.getDate()}/{returnDate.getMonth() + 1}/{returnDate.getFullYear().toString().slice(-2)}
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Return Date Picker Dropdown */}
                                                {showReturnDatePicker && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-slideDown min-w-[300px]">
                                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                            <button
                                                                type="button"
                                                                onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() - 1, 1))}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            >
                                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                </svg>
                                                            </button>

                                                            <div className="text-center">
                                                                <h3 className="text-lg font-bold text-gray-900">
                                                                    {monthNames[currentReturnMonth.getMonth()]} {currentReturnMonth.getFullYear()}
                                                                </h3>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() + 1, 1))}
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
                                                            {returnCalendarDays.map((date, index) => {
                                                                if (!date) {
                                                                    return <div key={`empty-${index}`} className="aspect-square" />;
                                                                }

                                                                const isToday = date.toDateString() === new Date().toDateString();
                                                                const isPast = isPastDate(date);
                                                                const isBefore = isBeforeDeparture(date);
                                                                const isSelected = isDateSelected(date, 'return');

                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => !isPast && !isBefore && handleReturnDateClick(date)}
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
                                                                    const tomorrow = new Date(selectedDate);
                                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                                    setReturnDate(tomorrow);
                                                                    setCurrentReturnMonth(tomorrow);
                                                                }}
                                                                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                                            >
                                                                Next Day
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowReturnDatePicker(false)}
                                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Return Time */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                        <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        Return Time
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <select
                                                        value={returnTime}
                                                        onChange={(e) => setReturnTime(e.target.value)}
                                                        className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-700 transition-all duration-200 appearance-none cursor-pointer font-medium text-sm"
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
                                    )}

                                    {/* Number of Persons */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                                                <div className="p-1 sm:p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-200">
                                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                </div>
                                                <span className="hidden sm:inline">Number of Passengers</span>
                                                <span className="sm:hidden">Passengers</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))}
                                                className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-lg sm:text-xl text-gray-700 hover:text-green-600"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{numberOfPersons}</div>
                                                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                                                    {numberOfPersons === 1 ? 'Passenger' : 'Passengers'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNumberOfPersons(Math.min(50, numberOfPersons + 1))}
                                                className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-lg sm:text-xl text-gray-700 hover:text-green-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            className="group relative w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3.5 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <span className="text-base sm:text-lg">
                                                    {serviceType === 'transfers' ? 'Search Available Rides' : 'View Available Cars'}
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 max-w-lg lg:mx-0 mx-auto px-4 sm:px-0">
                                <div className="flex items-center justify-center sm:justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white"></div>
                                            ))}
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm font-semibold text-gray-900">2,500+ Happy Riders</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">Booked this month</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col justify-start h-full order-1 lg:order-2 pt-0">
                            <div className="w-full relative">
                                <div className="relative space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-5xl xl:text-6xl 2xl:text-7xl font-black mb-4 leading-[1.1]">
                                            <span className="block text-white mb-2">
                                                Make Your
                                            </span>
                                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500">
                                                Ride Perfect
                                            </span>
                                        </h2>
                                    </div>

                                    <p className="text-xl xl:text-2xl text-white text-center leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] font-semibold px-4">
                                        <span className="block mt-2 text-white/95">Book your perfect ride in just a few clicks.</span>
                                    </p>

                                    <div className="space-y-5 pt-4 flex flex-col items-start mx-auto" style={{ width: 'fit-content' }}>
                                        <div className="group flex items-center gap-4 transform hover:scale-105 transition-all duration-300">
                                            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-300">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-white text-xl xl:text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] whitespace-nowrap">
                                                24/7 Available Service
                                            </span>
                                        </div>

                                        <div className="group flex items-center gap-4 transform hover:scale-105 transition-all duration-300">
                                            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-300">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-white text-xl xl:text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] whitespace-nowrap">
                                                Professional Drivers
                                            </span>
                                        </div>

                                        <div className="group flex items-center gap-4 transform hover:scale-105 transition-all duration-300">
                                            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-300">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-white text-xl xl:text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] whitespace-nowrap">
                                                All Over UAE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;