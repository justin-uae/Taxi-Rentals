import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    location: string;
    image: string;
    rating: number;
    comment: string;
    date: string;
}

const Testimonials: React.FC = () => {
    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Sarah Johnson",
            location: "New York, USA",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
            rating: 5,
            comment: "Absolutely fantastic service! Professional driver, immaculate vehicle, and the booking process was incredibly smooth. I'll definitely be using this chauffeur service again for my next trip.",
            date: "2 weeks ago"
        },
        {
            id: 2,
            name: "Michael Chen",
            location: "Singapore",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
            rating: 5,
            comment: "Best transportation experience I've had. The driver was courteous and professional, the prices were competitive, and the vehicle was pristine. Highly recommended for anyone needing reliable transport!",
            date: "1 month ago"
        },
        {
            id: 3,
            name: "Emma Rodriguez",
            location: "Barcelona, Spain",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
            rating: 5,
            comment: "I loved how punctual and professional the driver was. The customer service was outstanding and they went above and beyond to ensure I had a comfortable journey.",
            date: "3 weeks ago"
        },
        {
            id: 4,
            name: "David Kumar",
            location: "Dubai, UAE",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
            rating: 5,
            comment: "Premium chauffeur service at reasonable prices. The entire process from booking to arrival was seamless. Their 24/7 support team is also very responsive and helpful.",
            date: "1 week ago"
        },
        {
            id: 5,
            name: "Lisa Anderson",
            location: "London, UK",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
            rating: 5,
            comment: "I've used many transportation services, but this one stands out. Professional drivers, clean vehicles, and excellent customer service. They made my business trip so much easier!",
            date: "2 months ago"
        },
        {
            id: 6,
            name: "James Wilson",
            location: "Sydney, Australia",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
            rating: 5,
            comment: "The flexibility in booking transfers and the variety of vehicles with professional drivers is impressive. I got exactly what I needed for my family vacation. Will definitely book again!",
            date: "3 weeks ago"
        }
    ];

    return (
        <section className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        Testimonials
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our satisfied customers have to say about their chauffeur experience.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative group hover:-translate-y-2"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote className="h-16 w-16 text-orange-500" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-5 w-5 fill-orange-400 text-orange-400"
                                    />
                                ))}
                            </div>

                            {/* Comment */}
                            <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                                "{testimonial.comment}"
                            </p>

                            {/* User Info */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                {/* <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                                /> */}
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {testimonial.location}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                        {testimonial.date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-16 lg:mt-20">
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                        <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">
                            15K+
                        </div>
                        <p className="text-gray-700 font-semibold">
                            Happy Passengers
                        </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                        <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                            190+
                        </div>
                        <p className="text-gray-700 font-semibold">
                            Service Areas
                        </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                        <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                            500+
                        </div>
                        <p className="text-gray-700 font-semibold">
                            Professional Drivers
                        </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                        <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                            4.9
                        </div>
                        <p className="text-gray-700 font-semibold">
                            Average Rating
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;