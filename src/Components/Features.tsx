import React from 'react';
import { Shield, Clock, DollarSign, Headphones, MapPin, Star } from 'lucide-react';

const Features: React.FC = () => {
    const features = [
        {
            icon: <DollarSign className="h-8 w-8" />,
            title: "Best Price Guaranteed",
            description: "We offer the most competitive rates for chauffeur-driven services with no hidden fees",
            color: "from-orange-400 to-orange-500"
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Safe & Secure",
            description: "All our drivers are licensed professionals and vehicles are fully insured and regularly maintained",
            color: "from-blue-400 to-blue-500"
        },
        {
            icon: <Clock className="h-8 w-8" />,
            title: "24/7 Support",
            description: "Round-the-clock customer service to assist you with transfers and daily bookings whenever needed",
            color: "from-green-400 to-green-500"
        },
        {
            icon: <MapPin className="h-8 w-8" />,
            title: "Wide Coverage",
            description: "Professional chauffeur service available across 190+ locations throughout the UAE",
            color: "from-purple-400 to-purple-500"
        },
        {
            icon: <Star className="h-8 w-8" />,
            title: "Premium Quality",
            description: "Experienced professional drivers with well-maintained, premium vehicles for your comfort",
            color: "from-red-400 to-red-500"
        },
        {
            icon: <Headphones className="h-8 w-8" />,
            title: "Easy Booking",
            description: "Simple and quick reservation process for transfers and daily bookings with instant confirmation",
            color: "from-indigo-400 to-indigo-500"
        }
    ];

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose Us
                    </h2>
                    <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
                        Experience the difference with our premium chauffeur-driven transport service. We're committed to making your journey comfortable and hassle-free.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;