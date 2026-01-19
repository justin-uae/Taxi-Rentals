import React from 'react';
import { Search, Calendar, Key, CheckCircle } from 'lucide-react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            number: "01",
            icon: <Calendar className="h-8 w-8" />,
            title: "Pick Date & Time",
            description: "Select your pickup and return dates with flexible scheduling options",
            color: "from-blue-400 to-blue-500"
        },
        {
            number: "02",
            icon: <Search className="h-8 w-8" />,
            title: "Choose Your Car",
            description: "Browse our extensive fleet and select the perfect vehicle for your needs",
            color: "from-orange-400 to-orange-500"
        },
        {
            number: "03",
            icon: <Key className="h-8 w-8" />,
            title: "Book Your Ride",
            description: "Complete your reservation with our secure and easy booking process",
            color: "from-green-400 to-green-500"
        },
        {
            number: "04",
            icon: <CheckCircle className="h-8 w-8" />,
            title: "Start Your Journey",
            description: "Pick up your car and enjoy a smooth, comfortable driving experience",
            color: "from-purple-400 to-purple-500"
        }
    ];

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        Simple Process
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-300 text-base lg:text-lg max-w-2xl mx-auto">
                        Get on the road in just 4 easy steps. Our streamlined process makes booking your chauffeur-driven ride quick and hassle-free.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Connecting Line (hidden on mobile, shown on desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-gray-600 to-gray-700 z-0">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-gray-600"></div>
                                </div>
                            )}

                            {/* Step Card */}
                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 lg:p-8 border border-gray-600 hover:border-orange-500 transition-all duration-300 hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-orange-500/20">
                                {/* Step Number */}
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;