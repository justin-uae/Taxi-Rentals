import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Navigation, Clock, Users, ArrowRightLeft, Locate, Car, History, User, Mail, Phone, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import Banner5 from '../assets/Banner7.png';
import { formatDate, formatDateWithOrdinal, generateCalendar, generateTimeSlots, isDateWithin12Hours, isPastDate, isTimeAtLeast12HoursFromNow, updateSelectedTimeToValid } from '../utils/common';

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

// Country codes with dial codes
const countryCodes = [
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // Form Step State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Service Type State
    const [serviceType, setServiceType] = useState<ServiceType>('transfers');

    // Contact Information States
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+971');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Common States
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupDetails, setPickupDetails] = useState<PlaceDetails | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        return now;
    });
    const [selectedTime, setSelectedTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = '00';
        return `${hours}:${minutes}`;
    });
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
        tomorrow.setHours(tomorrow.getHours() + 12);
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
    const [returnTime, setReturnTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = '00';
        return `${hours}:${minutes}`;
    });

    // Daily Rental specific States
    const [dropoffDate, setDropoffDate] = useState<Date>(() => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        now.setHours(now.getHours() + 12);
        return now;
    });
    const [dropoffTime, setDropoffTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = '00';
        return `${hours}:${minutes}`;
    });
    const [showDropoffDatePicker, setShowDropoffDatePicker] = useState(false);
    const [currentDropoffMonth, setCurrentDropoffMonth] = useState(new Date());

    // Refs
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropoffInputRef = useRef<HTMLInputElement>(null);
    const pickupAutocompleteRef = useRef<any>(null);
    const dropoffAutocompleteRef = useRef<any>(null);
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Close country dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

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
        if (pickupDate.toDateString() === dropoffDate.toDateString()) {
            return 1;
        }
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

            if (pickupAutocompleteRef.current && pickupInputRef.current) {
                window.google.maps.event.clearInstanceListeners(pickupInputRef.current);
                pickupAutocompleteRef.current = null;
            }

            if (dropoffAutocompleteRef.current && dropoffInputRef.current) {
                window.google.maps.event.clearInstanceListeners(dropoffInputRef.current);
                dropoffAutocompleteRef.current = null;
            }

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

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        const updated = updateSelectedTimeToValid(date, selectedTime);
        setSelectedDate(updated.date);
        setSelectedTime(updated.time);

        if (serviceType === 'daily-rental') {
            if (dropoffDate < updated.date) {
                setDropoffDate(new Date(updated.date));
                const dropoffUpdated = updateSelectedTimeToValid(updated.date, dropoffTime);
                setDropoffDate(dropoffUpdated.date);
                setDropoffTime(dropoffUpdated.time);
            }
        }

        if (serviceType === 'transfers' && tripType === 'return') {
            if (returnDate < updated.date) {
                const tomorrow = new Date(updated.date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setReturnDate(tomorrow);
                const returnUpdated = updateSelectedTimeToValid(tomorrow, returnTime);
                setReturnDate(returnUpdated.date);
                setReturnTime(returnUpdated.time);
            }
        }

        setShowDatePicker(false);
    };

    const handleReturnDateClick = (date: Date) => {
        setReturnDate(date);
        const updated = updateSelectedTimeToValid(date, returnTime);
        setReturnDate(updated.date);
        setReturnTime(updated.time);
        setShowReturnDatePicker(false);
    };

    const handleDropoffDateClick = (date: Date) => {
        setDropoffDate(date);
        const updated = updateSelectedTimeToValid(date, dropoffTime);
        setDropoffDate(updated.date);
        setDropoffTime(updated.time);
        setShowDropoffDatePicker(false);
    };

    const handlePickupTimeChange = (time: string) => {
        if (!isTimeAtLeast12HoursFromNow(selectedDate, time)) {
            alert('Please select a time at least 12 hours from now');
            return;
        }
        setSelectedTime(time);
    };

    const handleReturnTimeChange = (time: string) => {
        if (!isTimeAtLeast12HoursFromNow(returnDate, time)) {
            alert('Please select a time at least 12 hours from now');
            return;
        }
        setReturnTime(time);
    };

    const handleDropoffTimeChange = (time: string) => {
        if (!isTimeAtLeast12HoursFromNow(dropoffDate, time)) {
            alert('Please select a time at least 12 hours from now');
            return;
        }
        setDropoffTime(time);
    };

    const sendEnquiryEmail = async () => {
        setIsSendingEmail(true);

        const enquiryData = {
            name: contactName,
            email: contactEmail,
            phone: `${countryCode}${contactPhone}`,
            serviceType: serviceType,
            pickupLocation: pickupLocation,
            dropoffLocation: serviceType === 'transfers' ? dropoffLocation : null,
            pickupDate: formatDate(selectedDate),
            pickupTime: formatTime12Hour(selectedTime),
            numberOfPersons: numberOfPersons,
            tripType: serviceType === 'transfers' ? tripType : null,
            distance: distance,
            duration: duration,
            dropoffDate: serviceType === 'daily-rental' ? formatDate(dropoffDate) : null,
            dropoffTime: serviceType === 'daily-rental' ? formatTime12Hour(dropoffTime) : null,
            returnDate: (serviceType === 'transfers' && tripType === 'return') ? formatDate(returnDate) : null,
            returnTime: (serviceType === 'transfers' && tripType === 'return') ? formatTime12Hour(returnTime) : null,
            rentalHours: serviceType === 'daily-rental' ? currentRentalHours : null
        };

        try {
            const appURL = import.meta.env.VITE_APP_URL;

            const response = await fetch(`${appURL}/api/enquiry.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enquiryData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email:', result.message);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contactName || !contactEmail || !contactPhone) {
            alert('Please fill in all contact details');
            return;
        }

        await sendEnquiryEmail();

        if (serviceType === 'transfers') {
            if (tripType === 'return' && !isTimeAtLeast12HoursFromNow(returnDate, returnTime)) {
                alert('Return time must be at least 12 hours from now');
                return;
            }

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
                    passengers: numberOfPersons,
                    contactName: contactName,
                    contactEmail: contactEmail,
                    contactPhone: `${countryCode}${contactPhone}`
                }
            });
        } else {
            if (!pickupLocation) {
                alert('Please select a pickup location');
                return;
            }

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
                    passengers: numberOfPersons,
                    contactName: contactName,
                    contactEmail: contactEmail,
                    contactPhone: `${countryCode}${contactPhone}`
                }
            });
        }
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

    const currentRentalHours = serviceType === 'daily-rental'
        ? calculateRentalHours(selectedDate, selectedTime, dropoffDate, dropoffTime)
        : 0;

    const pickupTimeSlots = generateTimeSlots(selectedDate);
    const returnTimeSlots = generateTimeSlots(returnDate);
    const dropoffTimeSlots = generateTimeSlots(dropoffDate);

    // Step validation functions
    const canProceedToStep2 = () => {
        if (serviceType === 'transfers') {
            return pickupLocation && dropoffLocation;
        } else {
            return pickupLocation;
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !canProceedToStep2()) {
            alert(serviceType === 'transfers'
                ? 'Please enter both pickup and destination locations'
                : 'Please enter pickup location');
            return;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl shadow-black/10 border border-white/30 max-w-lg lg:mx-0 mx-auto">
                                {/* Service Type Selector */}
                                <div className="mb-3 sm:mb-4">
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setServiceType('transfers');
                                                setCurrentStep(1);
                                            }}
                                            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg border-2 font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${serviceType === 'transfers'
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                                }`}
                                        >
                                            <Car className="h-3 w-3 sm:h-4 sm:w-4" />
                                            Transfers
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setServiceType('daily-rental');
                                                setCurrentStep(1);
                                            }}
                                            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg border-2 font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${serviceType === 'daily-rental'
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                                }`}
                                        >
                                            <History className="h-3 w-3 sm:h-4 sm:w-4" />
                                            Daily Bookings
                                        </button>
                                    </div>

                                    <h2 className="text-sm sm:text-base lg:text-lg font-bold text-orange-600 mb-1">
                                        {serviceType === 'transfers' ? 'Reserve Your Ride Now' : 'Reserve a Car for the Day'}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {serviceType === 'transfers'
                                            ? 'Experience luxury travel with professional drivers'
                                            : 'Choose from our premium fleet with driver included'
                                        }
                                    </p>
                                </div>

                                {/* Progress Steps */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        {[1, 2, 3].map((step) => (
                                            <React.Fragment key={step}>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${currentStep >= step
                                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                                        : 'bg-gray-200 text-gray-500'
                                                        }`}>
                                                        {step}
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs mt-1 font-medium ${currentStep >= step ? 'text-orange-600' : 'text-gray-400'}`}>
                                                        {step === 1 ? 'Location' : step === 2 ? 'Date & Time' : 'Contact'}
                                                    </span>
                                                </div>
                                                {step < 3 && (
                                                    <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition-all duration-300 ${currentStep > step ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSearch} className="space-y-2 sm:space-y-3">
                                    {/* STEP 1: Location Details */}
                                    {currentStep === 1 && (
                                        <div className="space-y-2 sm:space-y-3 animate-fadeIn">
                                            {serviceType === 'transfers' && (
                                                <>
                                                    {/* Trip Type Selection */}
                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                <div className="p-0.5 sm:p-1 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-md border border-indigo-200">
                                                                    <ArrowRightLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600" />
                                                                </div>
                                                                Trip Type
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTripTypeChange('one-way')}
                                                                className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg border-2 font-medium text-xs sm:text-sm transition-all duration-200 ${tripType === 'one-way'
                                                                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                One Way
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTripTypeChange('return')}
                                                                className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg border-2 font-medium text-xs sm:text-sm transition-all duration-200 ${tripType === 'return'
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
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                <div className="p-0.5 sm:p-1 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-md border border-orange-200">
                                                                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
                                                                </div>
                                                                Pickup Location
                                                            </label>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                                <input
                                                                    ref={pickupInputRef}
                                                                    type="text"
                                                                    placeholder="Enter pickup location"
                                                                    value={pickupLocation}
                                                                    onChange={(e) => setPickupLocation(e.target.value)}
                                                                    required
                                                                    className="relative w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-8 sm:pr-9 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                                />
                                                                <MapPin className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => getCurrentLocation('pickup')}
                                                                    disabled={isGettingCurrentLocation.pickup}
                                                                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Use current location"
                                                                >
                                                                    {isGettingCurrentLocation.pickup ? (
                                                                        <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-orange-600"></div>
                                                                    ) : (
                                                                        <Locate className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-orange-500" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Dropoff Location */}
                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                <div className="p-0.5 sm:p-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-md border border-blue-200">
                                                                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                                                                </div>
                                                                Destination
                                                            </label>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                                <input
                                                                    ref={dropoffInputRef}
                                                                    type="text"
                                                                    placeholder="Enter destination"
                                                                    value={dropoffLocation}
                                                                    onChange={(e) => setDropoffLocation(e.target.value)}
                                                                    required
                                                                    className="relative w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-8 sm:pr-9 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                                />
                                                                <MapPin className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => getCurrentLocation('dropoff')}
                                                                    disabled={isGettingCurrentLocation.dropoff}
                                                                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Use current location"
                                                                >
                                                                    {isGettingCurrentLocation.dropoff ? (
                                                                        <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-blue-600"></div>
                                                                    ) : (
                                                                        <Locate className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-blue-500" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Distance Display */}
                                                    {distance !== null && (
                                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 border-2 border-green-200 animate-fadeIn">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                                    <div className="p-1 sm:p-1.5 bg-white rounded-md shadow-sm">
                                                                        <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] sm:text-[10px] text-green-600 font-semibold uppercase tracking-wide">Route Distance</p>
                                                                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{distance.toFixed(1)} km</p>
                                                                    </div>
                                                                </div>
                                                                {duration && (
                                                                    <div className="text-right">
                                                                        <p className="text-[9px] sm:text-[10px] text-green-600 font-semibold uppercase tracking-wide">Est. Time</p>
                                                                        <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-900">{duration}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isCalculating && (
                                                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border-2 border-gray-200">
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-orange-600"></div>
                                                                <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Calculating distance...</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Daily Rental Pickup */}
                                            {serviceType === 'daily-rental' && (
                                                <div className="group">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                            <div className="p-0.5 sm:p-1 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-md border border-orange-200">
                                                                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
                                                            </div>
                                                            Pickup Location
                                                        </label>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                            <input
                                                                ref={pickupInputRef}
                                                                type="text"
                                                                placeholder="Enter pickup location"
                                                                value={pickupLocation}
                                                                onChange={(e) => setPickupLocation(e.target.value)}
                                                                required
                                                                className="relative w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-8 sm:pr-9 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                            />
                                                            <MapPin className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                                                            <button
                                                                type="button"
                                                                onClick={() => getCurrentLocation('pickup')}
                                                                disabled={isGettingCurrentLocation.pickup}
                                                                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Use current location"
                                                            >
                                                                {isGettingCurrentLocation.pickup ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-orange-600"></div>
                                                                ) : (
                                                                    <Locate className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-orange-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 2: Date & Time + Passengers */}
                                    {currentStep === 2 && (
                                        <div className="space-y-2 sm:space-y-3 animate-fadeIn max-h-[450px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-orange-300
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-orange-400">

                                            {/* Pickup Date and Time Row */}
                                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                                {/* Pickup Date Selection */}
                                                <div className="group relative">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                            <div className="p-0.5 sm:p-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-md border border-purple-200">
                                                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
                                                            </div>
                                                            <span className="hidden sm:inline">Pickup Date</span>
                                                            <span className="sm:hidden">Pickup</span>
                                                        </label>
                                                        {isDateWithin12Hours(selectedDate) && (
                                                            <span className="text-[9px] sm:text-[10px] text-red-600 font-medium">*12h</span>
                                                        )}
                                                    </div>
                                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                                            className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                                        >
                                                            <div className="text-gray-700 font-medium text-[10px] sm:text-xs">
                                                                {formatDateWithOrdinal(selectedDate)}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Date Picker Dropdown */}
                                                    {showDatePicker && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 z-50 animate-slideDown min-w-[240px] sm:min-w-[280px]">
                                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                                                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                    </svg>
                                                                </button>
                                                                <div className="text-center">
                                                                    <h3 className="text-sm sm:text-base font-bold text-gray-900">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                                                                </div>
                                                                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                                    <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1.5">{day}</div>
                                                                ))}
                                                            </div>
                                                            <div className="grid grid-cols-7 gap-1.5">
                                                                {departureCalendarDays.map((date, index) => {
                                                                    if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                                                                    const isToday = date.toDateString() === new Date().toDateString();
                                                                    const isPast = isPastDate(date);
                                                                    const isWithin12Hours = isDateWithin12Hours(date);
                                                                    const isSelected = isDateSelected(date, 'departure');
                                                                    return (
                                                                        <button key={index} type="button" onClick={() => !isPast && !isWithin12Hours && handleDateClick(date)} disabled={isPast || isWithin12Hours}
                                                                            className={`aspect-square rounded-md text-[11px] sm:text-xs font-medium transition-all duration-200 ${isPast || isWithin12Hours ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-50 cursor-pointer'} ${isSelected ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-700'} ${isToday && !isSelected ? 'border-2 border-purple-500' : ''}`}
                                                                            title={isWithin12Hours ? 'Must be at least 12 hours from now' : ''}>
                                                                            {date.getDate()}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                                <button type="button" onClick={() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); handleDateClick(tomorrow); }} className="text-[11px] sm:text-xs text-purple-600 hover:text-purple-700 font-semibold">Tomorrow</button>
                                                                <button type="button" onClick={() => setShowDatePicker(false)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-[11px] sm:text-xs font-semibold">Done</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pickup Time */}
                                                <div className="group">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                            <div className="p-0.5 sm:p-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-md border border-blue-200">
                                                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                                                            </div>
                                                            <span className="hidden sm:inline">Pickup Time</span>
                                                            <span className="sm:hidden">Time</span>
                                                        </label>
                                                    </div>
                                                    <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                        <select value={selectedTime} onChange={(e) => handlePickupTimeChange(e.target.value)} className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-700 text-[10px] sm:text-xs transition-all duration-200 appearance-none cursor-pointer font-medium">
                                                            {pickupTimeSlots.length > 0 ? pickupTimeSlots.map((time) => (<option key={time} value={time}>{formatTime12Hour(time)}</option>)) : (<option value="">No available times</option>)}
                                                        </select>
                                                        <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {pickupTimeSlots.length === 0 && (
                                                        <p className="text-[9px] sm:text-[10px] text-red-600 mt-1">No available times for today. Please select a future date.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Daily Rental: Dropoff Date/Time */}
                                            {serviceType === 'daily-rental' && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                                        {/* Dropoff Date */}
                                                        <div className="group relative">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                    <div className="p-0.5 sm:p-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-md border border-green-200">
                                                                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                                                                    </div>
                                                                    <span className="hidden sm:inline">Dropoff Date</span>
                                                                    <span className="sm:hidden">Dropoff</span>
                                                                </label>
                                                                {isDateWithin12Hours(dropoffDate) && (
                                                                    <span className="text-[9px] sm:text-[10px] text-red-600 font-medium">*12h</span>
                                                                )}
                                                            </div>
                                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowDropoffDatePicker(!showDropoffDatePicker)}
                                                                    className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 cursor-pointer text-left"
                                                                >
                                                                    <div className="text-gray-700 font-medium text-[10px] sm:text-xs">
                                                                        {formatDateWithOrdinal(dropoffDate)}
                                                                    </div>
                                                                </button>
                                                            </div>

                                                            {/* Dropoff Date Picker */}
                                                            {showDropoffDatePicker && (
                                                                <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 z-50 animate-slideDown min-w-[240px] sm:min-w-[280px]">
                                                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                                                        <button type="button" onClick={() => setCurrentDropoffMonth(new Date(currentDropoffMonth.getFullYear(), currentDropoffMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                            </svg>
                                                                        </button>
                                                                        <div className="text-center">
                                                                            <h3 className="text-sm sm:text-base font-bold text-gray-900">{monthNames[currentDropoffMonth.getMonth()]} {currentDropoffMonth.getFullYear()}</h3>
                                                                        </div>
                                                                        <button type="button" onClick={() => setCurrentDropoffMonth(new Date(currentDropoffMonth.getFullYear(), currentDropoffMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                                            <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1.5">{day}</div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="grid grid-cols-7 gap-1.5">
                                                                        {dropoffCalendarDays.map((date, index) => {
                                                                            if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                                                                            const isToday = date.toDateString() === new Date().toDateString();
                                                                            const isPast = isPastDate(date);
                                                                            const isWithin12Hours = isDateWithin12Hours(date);
                                                                            const isBefore = isBeforeDeparture(date);
                                                                            const isSelected = isDateSelected(date, 'dropoff');
                                                                            return (
                                                                                <button key={index} type="button" onClick={() => !isPast && !isWithin12Hours && !isBefore && handleDropoffDateClick(date)} disabled={isPast || isWithin12Hours || isBefore}
                                                                                    className={`aspect-square rounded-md text-[11px] sm:text-xs font-medium transition-all duration-200 ${isPast || isWithin12Hours || isBefore ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-green-50 cursor-pointer'} ${isSelected ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105' : 'text-gray-700'} ${isToday && !isSelected ? 'border-2 border-green-500' : ''}`}
                                                                                    title={isWithin12Hours ? 'Must be at least 12 hours from now' : isBefore ? 'Must be after pickup date' : ''}>
                                                                                    {date.getDate()}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                                        <button type="button" onClick={() => { const nextDay = new Date(selectedDate); nextDay.setDate(nextDay.getDate() + 1); handleDropoffDateClick(nextDay); }} className="text-[11px] sm:text-xs text-green-600 hover:text-green-700 font-semibold">Next Day</button>
                                                                        <button type="button" onClick={() => setShowDropoffDatePicker(false)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[11px] sm:text-xs font-semibold">Done</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Dropoff Time */}
                                                        <div className="group">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                    <div className="p-0.5 sm:p-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-md border border-green-200">
                                                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                                                                    </div>
                                                                    <span className="hidden sm:inline">Dropoff Time</span>
                                                                    <span className="sm:hidden">Time</span>
                                                                </label>
                                                            </div>
                                                            <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                                <select value={dropoffTime} onChange={(e) => handleDropoffTimeChange(e.target.value)} className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-700 text-[10px] sm:text-xs transition-all duration-200 appearance-none cursor-pointer font-medium">
                                                                    {dropoffTimeSlots.length > 0 ? dropoffTimeSlots.map((time) => (<option key={time} value={time}>{formatTime12Hour(time)}</option>)) : (<option value="">No available times</option>)}
                                                                </select>
                                                                <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            {dropoffTimeSlots.length === 0 && (
                                                                <p className="text-[9px] sm:text-[10px] text-red-600 mt-1">No available times for today. Please select a future date.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {currentRentalHours > 0 && (
                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-2 sm:p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[9px] sm:text-[10px] text-blue-600 font-semibold uppercase tracking-wide mb-0.5">Rental Duration</p>
                                                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{currentRentalHours.toFixed(1)} hours</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] sm:text-[10px] text-blue-600 font-semibold uppercase tracking-wide mb-0.5">Type</p>
                                                                    <p className="text-xs sm:text-sm font-bold text-blue-700">
                                                                        {currentRentalHours <= 5 ? 'Half Day' : currentRentalHours < 24 ? 'Full Day' : `${Math.ceil(currentRentalHours / 24)} Days`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Transfers: Return Date/Time for return trips */}
                                            {serviceType === 'transfers' && tripType === 'return' && (
                                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                                    {/* Return Date */}
                                                    <div className="group relative">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                <div className="p-0.5 sm:p-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-md border border-purple-200">
                                                                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
                                                                </div>
                                                                Return Date
                                                            </label>
                                                            {isDateWithin12Hours(returnDate) && (
                                                                <span className="text-[9px] sm:text-[10px] text-red-600 font-medium">*12h</span>
                                                            )}
                                                        </div>
                                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowReturnDatePicker(!showReturnDatePicker)}
                                                                className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 cursor-pointer text-left"
                                                            >
                                                                <div className="text-gray-700 font-medium text-[10px] sm:text-xs">
                                                                    {formatDateWithOrdinal(returnDate)}
                                                                </div>
                                                            </button>
                                                        </div>

                                                        {/* Return Date Picker */}
                                                        {showReturnDatePicker && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 z-50 animate-slideDown min-w-[240px] sm:min-w-[280px]">
                                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                                                    <button type="button" onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                        </svg>
                                                                    </button>
                                                                    <div className="text-center">
                                                                        <h3 className="text-sm sm:text-base font-bold text-gray-900">{monthNames[currentReturnMonth.getMonth()]} {currentReturnMonth.getFullYear()}</h3>
                                                                    </div>
                                                                    <button type="button" onClick={() => setCurrentReturnMonth(new Date(currentReturnMonth.getFullYear(), currentReturnMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                                        <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1.5">{day}</div>
                                                                    ))}
                                                                </div>
                                                                <div className="grid grid-cols-7 gap-1.5">
                                                                    {returnCalendarDays.map((date, index) => {
                                                                        if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                                                                        const isToday = date.toDateString() === new Date().toDateString();
                                                                        const isPast = isPastDate(date);
                                                                        const isWithin12Hours = isDateWithin12Hours(date);
                                                                        const isBefore = isBeforeDeparture(date);
                                                                        const isSelected = isDateSelected(date, 'return');
                                                                        return (
                                                                            <button key={index} type="button" onClick={() => !isPast && !isWithin12Hours && !isBefore && handleReturnDateClick(date)} disabled={isPast || isWithin12Hours || isBefore}
                                                                                className={`aspect-square rounded-md text-[11px] sm:text-xs font-medium transition-all duration-200 ${isPast || isWithin12Hours || isBefore ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-50 cursor-pointer'} ${isSelected ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105' : 'text-gray-700'} ${isToday && !isSelected ? 'border-2 border-purple-500' : ''}`}
                                                                                title={isWithin12Hours ? 'Must be at least 12 hours from now' : isBefore ? 'Must be after departure date' : ''}>
                                                                                {date.getDate()}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                                    <button type="button" onClick={() => { const nextDay = new Date(selectedDate); nextDay.setDate(nextDay.getDate() + 1); handleReturnDateClick(nextDay); }} className="text-[11px] sm:text-xs text-purple-600 hover:text-purple-700 font-semibold">Next Day</button>
                                                                    <button type="button" onClick={() => setShowReturnDatePicker(false)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-[11px] sm:text-xs font-semibold">Done</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Return Time */}
                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                                <div className="p-0.5 sm:p-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-md border border-blue-200">
                                                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                                                                </div>
                                                                Return Time
                                                            </label>
                                                        </div>
                                                        <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                            <select value={returnTime} onChange={(e) => handleReturnTimeChange(e.target.value)} className="relative w-full py-2 sm:py-2.5 px-2 sm:px-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-700 text-[10px] sm:text-xs transition-all duration-200 appearance-none cursor-pointer font-medium">
                                                                {returnTimeSlots.length > 0 ? returnTimeSlots.map((time) => (<option key={time} value={time}>{formatTime12Hour(time)}</option>)) : (<option value="">No available times</option>)}
                                                            </select>
                                                            <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        {returnTimeSlots.length === 0 && (
                                                            <p className="text-[9px] sm:text-[10px] text-red-600 mt-1">No available times for today. Please select a future date.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Number of Passengers */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                        <div className="p-0.5 sm:p-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-md border border-green-200">
                                                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                                                        </div>
                                                        <span className="hidden sm:inline">Number of Passengers</span>
                                                        <span className="sm:hidden">Passengers</span>
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <button type="button" onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-base sm:text-lg text-gray-700 hover:text-green-600">−</button>
                                                    <div className="flex-1 text-center">
                                                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{numberOfPersons}</div>
                                                        <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{numberOfPersons === 1 ? 'Passenger' : 'Passengers'}</div>
                                                    </div>
                                                    <button type="button" onClick={() => setNumberOfPersons(Math.min(50, numberOfPersons + 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center font-bold text-base sm:text-lg text-gray-700 hover:text-green-600">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: Contact Information */}
                                    {currentStep === 3 && (
                                        <div className="space-y-2 sm:space-y-3 animate-fadeIn">
                                            {/* Name Input */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                        <div className="p-0.5 sm:p-1 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-md border border-indigo-200">
                                                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600" />
                                                        </div>
                                                        Full Name
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <input type="text" placeholder="Enter your full name" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="relative w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200" />
                                                    <User className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                                                </div>
                                            </div>

                                            {/* Email Input */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                        <div className="p-0.5 sm:p-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-md border border-blue-200">
                                                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                                                        </div>
                                                        Email Address
                                                    </label>
                                                </div>
                                                <div className="relative transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    <input type="email" placeholder="your.email@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="relative w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200" />
                                                    <Mail className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                                                </div>
                                            </div>

                                            {/* Phone Input with Country Code */}
                                            <div className="group">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                        <div className="p-0.5 sm:p-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-md border border-green-200">
                                                            <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                                                        </div>
                                                        Phone Number
                                                    </label>
                                                </div>
                                                <div className="relative flex gap-1.5 sm:gap-2 transform transition-all duration-200 group-hover:scale-[1.01]">
                                                    {/* Country Code Dropdown */}
                                                    <div className="relative" ref={countryDropdownRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                                                        >
                                                            {/* <span className="text-xs sm:text-sm font-medium text-gray-700">{countryCodes.find(c => c.code === countryCode)?.flag}</span> */}
                                                            <span className="text-xs sm:text-sm font-medium text-gray-700">{countryCode}</span>
                                                            <ChevronDown className="h-3 w-3 text-gray-400" />
                                                        </button>

                                                        {/* Country Dropdown */}
                                                        {showCountryDropdown && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-slideDown max-h-[300px] overflow-y-auto">

                                                                {countryCodes.map((country) => (
                                                                    <button
                                                                        key={country.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setCountryCode(country.code);
                                                                            setShowCountryDropdown(false);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 transition-colors text-left"
                                                                    >
                                                                        <span className="text-base">{country.flag}</span>
                                                                        {/* <span className="text-xs font-medium text-gray-700 flex-1">{country.country}</span> */}
                                                                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">{country.code}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Phone Number Input */}
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="tel"
                                                            placeholder="501234567"
                                                            value={contactPhone}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                setContactPhone(value);
                                                            }}
                                                            required
                                                            className="w-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                        />
                                                        <Phone className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-2 sm:gap-3 pt-1.5 sm:pt-2">
                                        {currentStep > 1 && (
                                            <button type="button" onClick={handlePrevStep} className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span>Back</span>
                                            </button>
                                        )}

                                        {currentStep < totalSteps ? (
                                            <button type="button" onClick={handleNextStep} className={`${currentStep > 1 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm`}>
                                                <span>Next</span>
                                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </button>
                                        ) : (
                                            <button type="submit" disabled={!contactName || !contactEmail || !contactPhone || isSendingEmail} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                                                {isSendingEmail ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <span>{serviceType === 'transfers' ? 'Search Rides' : 'View Cars'}</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 max-w-lg lg:mx-0 mx-auto px-3 sm:px-0">
                                <div className="flex items-center justify-center sm:justify-between">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="flex -space-x-1.5 sm:-space-x-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white"></div>
                                            ))}
                                        </div>
                                        <div>
                                            <div className="text-[10px] sm:text-xs font-semibold text-gray-900">2,500+ Happy Riders</div>
                                            <div className="text-[8px] sm:text-[10px] text-gray-500">Booked this month</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Features */}
                        <div className="hidden lg:flex flex-col justify-start h-full order-1 lg:order-2 pt-0">
                            <div className="w-full relative">
                                <div className="relative space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-5xl xl:text-6xl 2xl:text-7xl font-black mb-4 leading-[1.1]">
                                            <span className="block text-white mb-2">Make Your</span>
                                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500">Ride Perfect</span>
                                        </h2>
                                    </div>
                                    <p className="text-xl xl:text-2xl text-white text-center leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] font-semibold px-4">
                                        <span className="block mt-2 text-white/95">Book your perfect ride in just a few clicks.</span>
                                    </p>
                                    <div className="space-y-5 pt-4 flex flex-col items-start mx-auto" style={{ width: 'fit-content' }}>
                                        {[
                                            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "24/7 Available Service" },
                                            { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", text: "Professional Drivers" },
                                            { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", text: "All Over UAE" },
                                            { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", text: "Low Price Guaranteed" }
                                        ].map((feature, idx) => (
                                            <div key={idx} className="group flex items-center gap-4 transform hover:scale-105 transition-all duration-300">
                                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-300">
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={feature.icon} />
                                                    </svg>
                                                </div>
                                                <span className="text-white text-xl xl:text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] whitespace-nowrap">{feature.text}</span>
                                            </div>
                                        ))}
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