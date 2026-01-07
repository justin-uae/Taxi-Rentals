import React from 'react';
import { Users, Briefcase, Star, Check } from 'lucide-react';
import type { TaxiCardProps } from '../../types';

const calculatePrice = (taxi: any, distance: number, tripType?: 'one-way' | 'return') => {
    let basePrice = 0;

    // If we have a variant price (from KM ranges), use it
    if ('displayPrice' in taxi && taxi.displayPrice) {
        basePrice = taxi.displayPrice;
    } else {
        // Otherwise calculate from base + per km
        basePrice = Math.round(taxi.baseFare + (taxi.perKmRate * distance));
    }

    // Double for return trips
    return tripType === 'return' ? basePrice * 2 : basePrice;
};

const TaxiCard: React.FC<TaxiCardProps> = ({
    taxi,
    isSelected,
    distance,
    tripType = 'one-way',
    onSelect,
    onBookNow
}) => {
    const totalPrice = calculatePrice(taxi, distance, tripType);
    const isMobile = window.innerWidth < 1024;

    const handleCardClick = () => {
        onSelect(taxi.id);
    };

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBookNow(taxi.id);
    };

    if (isMobile) {
        return (
            <div
                className={`bg-white rounded-lg overflow-hidden shadow-md ${isSelected ? 'border-2 border-orange-500' : 'border border-gray-200'}`}
                onClick={handleCardClick}
            >
                <div className="p-3">
                    <div className="flex gap-3">
                        {/* Taxi Image */}
                        <div className="w-24 flex-shrink-0">
                            <div className="relative h-20 rounded-lg overflow-hidden">
                                <img
                                    src={taxi.image}
                                    alt={taxi.name}
                                    className="w-full h-full object-cover"
                                />
                                {tripType === 'return' && (
                                    <div className="absolute top-1 left-1 right-1 bg-green-600/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-bold text-center">
                                        Round Trip
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Taxi Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-bold text-gray-900 text-sm truncate">
                                    {taxi.name}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                    <span className="text-xs font-semibold">{taxi.rating}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                <Users className="h-3 w-3" />
                                <span>{taxi.passengers} seats</span>
                                <span>•</span>
                                <Briefcase className="h-3 w-3" />
                                <span>{taxi.luggage} bags</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-500">
                                        {tripType === 'return' ? 'Round Trip' : 'Total Fare'}
                                    </div>
                                    <div className="font-bold text-gray-900">AED {totalPrice}</div>
                                </div>
                                <button
                                    onClick={handleBookClick}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isSelected
                                        ? 'bg-green-600 text-white'
                                        : 'bg-orange-500 text-white'}`}
                                >
                                    {isSelected ? 'Selected' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${isSelected
                ? 'border-orange-500 ring-2 ring-orange-100'
                : 'border-transparent hover:border-orange-200'}`}
            onClick={handleCardClick}
        >
            <div className="p-6">
                <div className="flex gap-6">
                    {/* Taxi Image */}
                    <div className="w-48 flex-shrink-0">
                        <div className="relative h-full rounded-lg overflow-hidden">
                            <img
                                src={taxi.image}
                                alt={taxi.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                                {taxi.type}
                            </div>
                            {taxi.popular && (
                                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                   Popular
                                </div>
                            )}
                            {tripType === 'return' && (
                                <div className="absolute bottom-3 left-3 right-3 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold text-center">
                                    Round Trip
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Taxi Details */}
                    <div className="flex-1">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{taxi.name}</h3>
                                    {isSelected && (
                                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                            <Check className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Selected</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                                        <span className="font-semibold text-gray-900">{taxi.rating}</span>
                                        <span className="text-gray-500 text-sm">({taxi.reviews.toLocaleString()})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">{taxi.passengers} seats</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Briefcase className="h-4 w-4" />
                                        <span className="text-sm">{taxi.luggage} bags</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {taxi.features.slice(0, 3).map((feature: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs rounded-lg font-medium border border-gray-200"
                                            >
                                                ✓ {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Price & CTA */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        {tripType === 'return' ? 'Round Trip Fare' : 'One-Way Fare'}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            AED {totalPrice}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        All fees included • Fixed rate
                                    </p>
                                </div>
                                <button
                                    onClick={handleBookClick}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${isSelected
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'}`}
                                >
                                    {isSelected ? 'Ride Selected' : 'Select This Ride'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxiCard;