import React from 'react';
import type { FiltersProps } from '../../types';

const Filters: React.FC<FiltersProps> = ({ activeFilter, sortBy, onFilterChange, onSortChange }) => {
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
        return (
            <div className="mb-4 overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    <button
                        onClick={() => onFilterChange('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === 'all'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        All
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as any)}
                        className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-xs font-medium"
                    >
                        <option value="price">Price</option>
                        <option value="passengers">Seats</option>
                    </select>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3 mb-6">
            <button
                onClick={() => onFilterChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            >
                All Vehicles
            </button>
            <div className="ml-auto">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="price">Sort by: Price (Low to High)</option>
                    <option value="passengers">Sort by: Seats</option>
                </select>
            </div>
        </div>
    );
};

export default Filters;