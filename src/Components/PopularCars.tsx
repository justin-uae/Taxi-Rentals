import React, { useEffect } from 'react';
import { Users, Briefcase, Star, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTaxiProducts } from '../store/slices/shopifySlice';

const PopularCars: React.FC = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error, initialized } = useAppSelector((state) => state.shopify);

    // Fetch products on mount
    useEffect(() => {
        if (!initialized) {
            dispatch(fetchTaxiProducts());
        }
    }, [dispatch, initialized]);

    // Loading state
    if (loading && !initialized) {
        return (
            <section className="py-16 lg:py-24 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="h-12 w-12 text-orange-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Loading our fleet...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <section className="py-16 lg:py-24 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-gray-900 font-semibold mb-2">Failed to load vehicles</p>
                        <p className="text-gray-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => dispatch(fetchTaxiProducts())}
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Get only popular products or first 6 products
    const displayedProducts = products
        .filter(product => product.popular)
        .slice(0, 6);

    // If no popular products, show first 6
    const carsToShow = displayedProducts.length > 0 ? displayedProducts : products.slice(0, 6);

    return (
        <section className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        Popular Rentals
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Our Fleet
                    </h2>
                    <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
                        Choose from our wide selection of well-maintained vehicles. From economy to luxury, we have the perfect car for your journey.
                    </p>
                </div>

                {/* Cars Grid */}
                {carsToShow.length > 0 ? (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {carsToShow?.map((car) => (
                                <div
                                    key={car?.id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200"
                                >
                                    {/* Car Image */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-56">
                                        <img
                                            src={car?.image}
                                            alt={car?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Badges */}
                                        {car?.popular && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                                Popular
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-lg">
                                            {car?.type}
                                        </div>
                                    </div>

                                    {/* Car Details */}
                                    <div className="p-6">
                                        {/* Name & Rating */}
                                        <div className="mb-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                                {car?.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
                                                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                                                    <span className="text-sm font-bold text-orange-600">
                                                        {car?.rating}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {car?.reviews} reviews
                                                </span>
                                            </div>
                                        </div>

                                        {/* Specifications */}
                                        <div className="space-y-3 mb-5 pb-5 border-b-2 border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5 text-gray-700">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold">{car?.passengers} Passengers</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-gray-700">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <Briefcase className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold">{car?.luggage} Bags</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        {car?.features && car.features.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                                                    Features
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {car.features.slice(0, 3)?.map((feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                            {feature}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-orange-500/20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No vehicles available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularCars;