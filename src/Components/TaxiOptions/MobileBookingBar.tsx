import React from 'react';
import type { MobileBookingBarProps } from '../../types';

const calculatePrice = (baseFare: number, perKmRate: number, distance: number) => {
    return Math.round(baseFare + (perKmRate * distance));
};

const MobileBookingBar: React.FC<MobileBookingBarProps> = ({ selectedTaxi, distance, onBookNow }) => {
    if (!selectedTaxi) return null;

    const totalPrice = calculatePrice(selectedTaxi.baseFare, selectedTaxi.perKmRate, distance);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-2xl z-50">
            <div className="container mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-600">Selected Ride</p>
                        <p className="font-bold text-gray-900 text-sm">
                            {selectedTaxi.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-600">Total Fare</p>
                            <p className="font-bold text-gray-900">
                                AED {totalPrice}
                            </p>
                        </div>
                        <button
                            onClick={onBookNow}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg text-sm"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileBookingBar;