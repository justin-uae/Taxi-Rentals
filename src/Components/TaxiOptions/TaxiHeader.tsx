import React from 'react';
import { ChevronLeft, Calendar, Navigation, ArrowRight } from 'lucide-react';
import type { HeaderProps } from '../../types';

const TaxiHeader: React.FC<HeaderProps> = ({ searchDetails, onEditSearch, isMobile = false }) => {
    const distance = searchDetails.distance || 18.5;
    const duration = searchDetails.duration || "25 mins";

    if (isMobile) {
        return (
            <div className="lg:hidden">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={onEditSearch}
                        className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-lg">
                        <Navigation className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-900">
                            {distance.toFixed(1)} km
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {searchDetails.from}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {searchDetails.to}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={onEditSearch}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-semibold group"
                >
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Edit Search</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{searchDetails.date} at {searchDetails.time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                        <Navigation className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">
                            {distance.toFixed(1)} km • {duration}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">From</p>
                            <p className="font-bold text-gray-900 truncate">
                                {searchDetails.from}
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">To</p>
                            <p className="font-bold text-gray-900 truncate">
                                {searchDetails.to}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxiHeader;