import React from 'react';
import { Users, Briefcase, Fuel, Settings, Star, ArrowRight } from 'lucide-react';

interface Car {
    id: number;
    name: string;
    category: string;
    image: string;
    rating: number;
    reviews: number;
    passengers: number;
    luggage: number;
    transmission: string;
    fuel: string;
    pricePerDay: number;
    popular?: boolean;
}

const PopularCars: React.FC = () => {
    const cars: Car[] = [
        {
            id: 1,
            name: "Toyota Camry",
            category: "Sedan",
            image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
            rating: 4.8,
            reviews: 256,
            passengers: 5,
            luggage: 3,
            transmission: "Automatic",
            fuel: "Hybrid",
            pricePerDay: 45,
            popular: true
        },
        {
            id: 2,
            name: "Jeep Wrangler",
            category: "SUV",
            image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&h=300&fit=crop",
            rating: 4.9,
            reviews: 189,
            passengers: 5,
            luggage: 4,
            transmission: "Automatic",
            fuel: "Petrol",
            pricePerDay: 75,
            popular: true
        },
        {
            id: 3,
            name: "BMW 3 Series",
            category: "Luxury",
            image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop",
            rating: 4.7,
            reviews: 145,
            passengers: 5,
            luggage: 2,
            transmission: "Automatic",
            fuel: "Petrol",
            pricePerDay: 95
        },
        {
            id: 4,
            name: "Tesla Model 3",
            category: "Electric",
            image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=300&fit=crop",
            rating: 5.0,
            reviews: 312,
            passengers: 5,
            luggage: 3,
            transmission: "Automatic",
            fuel: "Electric",
            pricePerDay: 85,
            popular: true
        },
        {
            id: 5,
            name: "Honda CR-V",
            category: "SUV",
            image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop",
            rating: 4.6,
            reviews: 198,
            passengers: 7,
            luggage: 4,
            transmission: "Automatic",
            fuel: "Hybrid",
            pricePerDay: 65
        },
        {
            id: 6,
            name: "Mercedes-Benz E-Class",
            category: "Luxury",
            image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop",
            rating: 4.9,
            reviews: 267,
            passengers: 5,
            luggage: 3,
            transmission: "Automatic",
            fuel: "Diesel",
            pricePerDay: 120
        }
    ];

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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Car Image */}
                            <div className="relative overflow-hidden bg-gray-100 h-48">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {car.popular && (
                                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        Popular
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                                    {car.category}
                                </div>
                            </div>

                            {/* Car Details */}
                            <div className="p-6">
                                {/* Name & Rating */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {car.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {car.rating}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({car.reviews} reviews)
                                        </span>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">{car.passengers} Seats</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Briefcase className="h-4 w-4" />
                                        <span className="text-sm">{car.luggage} Bags</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Settings className="h-4 w-4" />
                                        <span className="text-sm">{car.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Fuel className="h-4 w-4" />
                                        <span className="text-sm">{car.fuel}</span>
                                    </div>
                                </div>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Starting from</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${car.pricePerDay}
                                            <span className="text-sm font-normal text-gray-500">/day</span>
                                        </p>
                                    </div>
                                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 group">
                                        <span className="text-sm">Rent Now</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
                        <span>View All Vehicles</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PopularCars;