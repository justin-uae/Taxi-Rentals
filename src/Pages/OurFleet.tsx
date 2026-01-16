import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Star, Loader, AlertCircle, RefreshCw, Filter, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTaxiProducts } from '../store/slices/shopifySlice';

const OurFleet: React.FC = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error, initialized } = useAppSelector((state) => state.shopify);

    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('passengers-low');

    // Fetch products on mount
    useEffect(() => {
        if (!initialized) {
            dispatch(fetchTaxiProducts());
        }
    }, [dispatch, initialized]);

    // Get unique vehicle types
    const vehicleTypes = ['all', ...Array.from(new Set(products.map(p => p.type)))];

    // Filter and sort products
    const filteredProducts = products
        .filter(product => filterType === 'all' || product.type === filterType)
        .sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
                case 'rating':
                    return b.rating - a.rating;
                case 'price-low':
                    return a.baseFare - b.baseFare;
                case 'price-high':
                    return b.baseFare - a.baseFare;
                case 'passengers-low':
                    return a.passengers - b.passengers;
                case 'passengers-high':
                    return b.passengers - a.passengers;
                default:
                    return 0;
            }
        });


    // Loading state
    if (loading && !initialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 pt-16">
                <div className="container mx-auto px-4 py-20">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="h-16 w-16 text-orange-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium text-lg">Loading our fleet...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 pt-16">
                <div className="container mx-auto px-4 py-20">
                    <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                        <p className="text-gray-900 font-semibold text-xl mb-2">Failed to load vehicles</p>
                        <p className="text-gray-600 text-sm mb-6">{error}</p>
                        <button
                            onClick={() => dispatch(fetchTaxiProducts())}
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 pt-16">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                            Our Fleet
                        </h1>
                        <p className="text-lg md:text-xl text-orange-100">
                            Discover our wide range of vehicles - from economy to luxury
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {/* Filters and Sort */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Filter by Type */}
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Filter className="inline h-4 w-4 mr-1" />
                                Filter by Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {vehicleTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${filterType === type
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type === 'all' ? 'All Vehicles' : type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="lg:w-64">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 font-medium"
                            >
                                <option value="passengers-low">Least Passengers</option>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="passengers-high">Most Passengers</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {filterType !== 'all' && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-600">Active filter:</span>
                            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                {filterType}
                                <button
                                    onClick={() => setFilterType('all')}
                                    className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 font-medium">
                        Showing <span className="text-orange-600 font-bold">{filteredProducts.length}</span> vehicle{filteredProducts.length !== 1 ? 's' : ''}
                        {filterType !== 'all' && ` in ${filterType} category`}
                    </p>
                </div>

                {/* Fleet Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                        {filteredProducts.map((car) => (
                            <div
                                key={car.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-orange-200"
                            >
                                {/* Car Image */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-40 sm:h-44">
                                    <img
                                        src={car.image}
                                        alt={car.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Badges */}
                                    {car.popular && (
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                                            Popular
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-lg">
                                        {car.type}
                                    </div>
                                </div>

                                {/* Car Details */}
                                <div className="p-4">
                                    {/* Name & Rating */}
                                    <div className="mb-3">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                                            {car.name}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                                                <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                                                <span className="text-xs font-bold text-orange-600">
                                                    {car.rating}
                                                </span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                                {car.reviews} reviews
                                            </span>
                                        </div>
                                    </div>

                                    {/* Specifications */}
                                    <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <div className="p-1.5 bg-blue-50 rounded-lg">
                                                    <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                                                </div>
                                                <span className="text-xs font-semibold">{car.passengers}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <div className="p-1.5 bg-purple-50 rounded-lg">
                                                    <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
                                                </div>
                                                <span className="text-xs font-semibold">{car.luggage} bags</span>
                                            </div>
                                        </div>

                                        {/* Driver Included Badge */}
                                        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl py-2 px-3">
                                            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-xs font-bold text-orange-700">Professional Driver Included</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                            <AlertCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters to see more results
                        </p>
                        {filterType !== 'all' && (
                            <button
                                onClick={() => setFilterType('all')}
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OurFleet;