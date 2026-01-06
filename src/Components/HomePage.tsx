import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Navigation, Clock, Users } from 'lucide-react';
import Banner3 from '../assets/Banner3.png';

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

const Homepage: React.FC = () => {
    const navigate = useNavigate();

    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [pickupDetails, setPickupDetails] = useState<PlaceDetails | null>(null);
    const [dropoffDetails, setDropoffDetails] = useState<PlaceDetails | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [distance, setDistance] = useState<number | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedTime, setSelectedTime] = useState('10:00');
    const [numberOfPersons, setNumberOfPersons] = useState(1);

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

    // Initialize Google Maps Places Autocomplete
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            const existingScript = document.getElementById('google-maps-script');

            if (!existingScript) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                const googleMapAPIKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

                script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapAPIKey}&libraries=places`;
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
                        setPickupLocation(place.formatted_address);
                        setPickupDetails({
                            address: place.formatted_address,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        });
                    }
                });
            }

            // Initialize dropoff autocomplete
            if (dropoffInputRef.current && !dropoffAutocompleteRef.current) {
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
    }, []);

    // Calculate distance when both locations are selected
    useEffect(() => {
        if (pickupDetails && dropoffDetails && window.google) {
            calculateDistance();
        } else {
            setDistance(null);
            setDuration(null);
        }
    }, [pickupDetails, dropoffDetails]);

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
                    // Distance in kilometers
                    const distanceInKm = result.distance.value / 1000;
                    setDistance(distanceInKm);
                    // Duration text (e.g., "25 mins")
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

        if (!pickupLocation || !dropoffLocation) {
            alert('Please select both pickup and dropoff locations');
            return;
        }

        navigate('/taxi-options', {
            state: {
                from: pickupLocation,
                to: dropoffLocation,
                fromCoords: pickupDetails ? { lat: pickupDetails.lat, lng: pickupDetails.lng } : null,
                toCoords: dropoffDetails ? { lat: dropoffDetails.lat, lng: dropoffDetails.lng } : null,
                distance: distance,
                duration: duration,
                date: formatDate(selectedDate),
                time: formatTime12Hour(selectedTime),
                passengers: numberOfPersons
            }
        });
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

    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

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

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isDateSelected = (date: Date) => {
        if (!date) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const calendarDays = generateCalendar();
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-8 lg:py-12 mt-10">
                    {/* Left Column - Booking Form */}
                    <div className="max-w-md w-full mx-auto lg:mx-0 order-2 lg:order-1">
                        <div className="mb-6 lg:mb-8">
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                                Make Your
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600">
                                    Ride Perfect
                                </span>
                            </h1>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Pickup Location */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="p-1.5 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-200">
                                            <MapPin className="h-4 w-4 text-orange-600" />
                                        </div>
                                        Pickup Location
                                    </label>
                                </div>
                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <input
                                        ref={pickupInputRef}
                                        type="text"
                                        placeholder="Enter pickup location"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                        required
                                        className="relative w-full py-4 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-gray-700 placeholder-gray-400 transition-all duration-200"
                                    />
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                                </div>
                            </div>

                            {/* Dropoff Location */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                        </div>
                                        Destination
                                    </label>
                                </div>
                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <input
                                        ref={dropoffInputRef}
                                        type="text"
                                        placeholder="Enter destination"
                                        value={dropoffLocation}
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                        required
                                        className="relative w-full py-4 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-700 placeholder-gray-400 transition-all duration-200"
                                    />
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                                </div>
                            </div>

                            {/* Distance Display */}
                            {distance !== null && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Navigation className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Route Distance</p>
                                                <p className="text-2xl font-bold text-gray-900">{distance.toFixed(1)} km</p>
                                            </div>
                                        </div>
                                        {duration && (
                                            <div className="text-right">
                                                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Est. Time</p>
                                                <p className="text-lg font-bold text-gray-900">{duration}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Calculating Indicator */}
                            {isCalculating && (
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                                        <p className="text-sm text-gray-600 font-medium">Calculating distance...</p>
                                    </div>
                                </div>
                            )}

                            {/* Date and Time Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Date Selection */}
                                <div className="group relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-200">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                            </div>
                                            Travel Date
                                        </label>
                                    </div>
                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                        <button
                                            type="button"
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className="relative w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                        >
                                            <div className="text-gray-700 font-medium text-sm">
                                                {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear().toString().slice(-2)}
                                            </div>
                                        </button>
                                    </div>

                                    {/* Date Picker Dropdown */}
                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-slideDown min-w-[300px]">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={previousMonth}
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
                                                    onClick={nextMonth}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Day headers */}
                                            <div className="grid grid-cols-7 gap-2 mb-2">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar grid */}
                                            <div className="grid grid-cols-7 gap-2">
                                                {calendarDays.map((date, index) => {
                                                    if (!date) {
                                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                                    }

                                                    const isToday = date.toDateString() === new Date().toDateString();
                                                    const isPast = isPastDate(date);
                                                    const isSelected = isDateSelected(date);

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

                                            {/* Footer */}
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

                                {/* Time Selection */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-200">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            </div>
                                            Time
                                        </label>
                                    </div>
                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                        <select
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
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

                            {/* Number of Persons */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-200">
                                            <Users className="h-4 w-4 text-green-600" />
                                        </div>
                                        Number of Passengers
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))}
                                        className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-xl text-gray-700 hover:text-green-600"
                                    >
                                        −
                                    </button>
                                    <div className="flex-1 text-center">
                                        <div className="text-3xl font-bold text-gray-900">{numberOfPersons}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {numberOfPersons === 1 ? 'Passenger' : 'Passengers'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNumberOfPersons(Math.min(8, numberOfPersons + 1))}
                                        className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-xl text-gray-700 hover:text-green-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    className="group relative w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                                >
                                    {/* Background shine effect */}
                                    <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                    {/* Button content */}
                                    <div className="relative flex items-center justify-center gap-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-lg">Search Available Rides</span>
                                    </div>
                                </button>
                            </div>
                        </form>

                        {/* Trust indicators */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white"></div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">2,500+ Happy Riders</div>
                                        <div className="text-xs text-gray-500">Booked this month</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Hero Image */}
                    <div className="relative w-full order-1 lg:order-2">
                        <div className="relative">
                            <img
                                src={Banner3}
                                alt="Orange Jeep Wrangler"
                                className="w-full h-auto object-cover relative z-10 rounded-[30px] md:rounded-[50px] lg:rounded-[100px]"
                                style={{
                                    filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.15))',
                                    maxWidth: '100%',
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
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

export default Homepage;