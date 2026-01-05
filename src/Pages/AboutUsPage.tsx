import React from 'react';
import { Award, Users, Car, Clock, Shield, TrendingUp, CheckCircle, Star, Heart, Zap, Target, Globe } from 'lucide-react';

const AboutUs: React.FC = () => {
    const stats = [
        { icon: Users, value: '50K+', label: 'Happy Customers', color: 'from-blue-500 to-blue-600' },
        { icon: Car, value: '500+', label: 'Fleet Vehicles', color: 'from-orange-500 to-orange-600' },
        { icon: Clock, value: '24/7', label: 'Available Service', color: 'from-green-500 to-green-600' },
        { icon: Award, value: '15+', label: 'Years Experience', color: 'from-purple-500 to-purple-600' }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Safety First',
            description: 'Your safety is our top priority. All our drivers are thoroughly vetted and vehicles are regularly inspected.',
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: Heart,
            title: 'Customer Care',
            description: 'We treat every passenger like family, ensuring comfort and satisfaction throughout your journey.',
            color: 'bg-red-100 text-red-600'
        },
        {
            icon: Zap,
            title: 'Quick Response',
            description: 'Fast booking, prompt arrival, and efficient service. We value your time as much as you do.',
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            icon: Target,
            title: 'Excellence',
            description: 'We strive for excellence in every ride, from professional drivers to premium vehicles.',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: Globe,
            title: 'Innovation',
            description: 'Leveraging cutting-edge technology to provide seamless booking and tracking experiences.',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: Star,
            title: 'Quality Service',
            description: 'Consistently delivering high-quality service that exceeds expectations every single time.',
            color: 'bg-orange-100 text-orange-600'
        }
    ];

    const milestones = [
        { year: '2009', title: 'Founded', description: 'DubaiCab was established with a vision to revolutionize taxi services in UAE' },
        { year: '2012', title: 'Fleet Expansion', description: 'Expanded our fleet to 100+ vehicles across Dubai and Abu Dhabi' },
        { year: '2016', title: 'Technology Integration', description: 'Launched our mobile app for seamless booking experience' },
        { year: '2020', title: 'Premium Services', description: 'Introduced luxury and electric vehicle options' },
        { year: '2024', title: 'Market Leader', description: 'Became one of the most trusted taxi services in UAE' }
    ];

    const features = [
        'Professional & Licensed Drivers',
        'Clean & Well-Maintained Vehicles',
        'Transparent Pricing',
        'GPS Tracking',
        'Multiple Payment Options',
        '24/7 Customer Support',
        'Online Booking System',
        'Corporate Packages',
        'Airport Transfers',
        'Eco-Friendly Options'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 md:py-28 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 animate-fade-in">
                            About DubaiCab
                        </h1>
                        <p className="text-xl md:text-2xl text-orange-100 mb-8 animate-fade-in-delay">
                            Your Trusted Partner in Premium Transportation
                        </p>
                        <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto animate-fade-in-delay-2">
                            Since 2009, we've been providing safe, reliable, and comfortable taxi services across Dubai and Abu Dhabi. Our commitment to excellence has made us the preferred choice for thousands of passengers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 -mt-16 relative z-20 mb-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-xl p-6 text-center hover:scale-105 transition-transform duration-300 border border-gray-100"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl mb-4`}>
                                <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Story Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Founded in 2009, DubaiCab began with a simple mission: to provide the most reliable and comfortable taxi service in the UAE. What started as a small fleet of 10 vehicles has grown into one of the region's most trusted transportation providers.
                                </p>
                                <p>
                                    Our journey has been driven by our unwavering commitment to customer satisfaction, safety, and innovation. We've embraced technology while maintaining the personal touch that sets us apart.
                                </p>
                                <p>
                                    Today, we're proud to serve over 50,000 satisfied customers annually, operating a fleet of 500+ modern vehicles, and employing hundreds of professional drivers who share our passion for excellence.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center">
                                    <Car className="h-64 w-64 text-orange-500 opacity-20" />
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                    <span className="text-2xl font-bold text-gray-900">95%</span>
                                </div>
                                <p className="text-sm text-gray-600">Customer Satisfaction Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                                    <Target className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    To provide safe, reliable, and comfortable transportation services that exceed customer expectations while embracing innovation and sustainability for a better tomorrow.
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                                    <Globe className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    To become the most trusted and preferred taxi service across the UAE, recognized for our commitment to excellence, innovation, and customer care.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="container mx-auto px-4 py-16 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 ${value.color} rounded-2xl mb-4`}>
                                    <value.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Our Journey
                            </h2>
                            <p className="text-lg text-gray-600">
                                Key milestones in our growth story
                            </p>
                        </div>

                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={index}
                                    className="flex gap-6 group"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                                            {milestone.year}
                                        </div>
                                        {index !== milestones.length - 1 && (
                                            <div className="w-0.5 h-full bg-orange-300 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-white rounded-2xl p-6 shadow-md group-hover:shadow-xl transition-all border border-orange-200">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {milestone.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* What We Offer */}
            <div className="container mx-auto px-4 py-16 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What We Offer
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive services designed for your comfort and convenience
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100"
                            >
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                </div>
                                <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Experience the Difference?
                        </h2>
                        <p className="text-xl text-orange-100 mb-8">
                            Join thousands of satisfied customers who trust DubaiCab for their transportation needs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="bg-white text-orange-600 font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                            >
                                <Car className="h-5 w-5" />
                                Book a Ride Now
                            </a>
                            <a
                                href="/contact"
                                className="bg-orange-700 text-white font-bold py-4 px-8 rounded-xl hover:bg-orange-800 hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2 border-2 border-white/20"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-delay {
                    0%, 20% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-delay-2 {
                    0%, 40% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out forwards;
                }

                .animate-fade-in-delay {
                    animation: fade-in-delay 1.2s ease-out forwards;
                }

                .animate-fade-in-delay-2 {
                    animation: fade-in-delay-2 1.4s ease-out forwards;
                }

                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
};

export default AboutUs;