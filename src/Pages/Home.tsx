import React from 'react';
import Features from '../Components/Features';
import PopularCars from '../Components/PopularCars';
import HowItWorks from '../Components/HowItWorks';
import Testimonials from '../Components/Testimonials';
import Homepage from '../Components/HomePage';

const CompletePage: React.FC = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section with Booking Form */}
            <Homepage />

            {/* Popular Cars Section */}
            <PopularCars />
            
            {/* Features Section */}
            <Features />

            {/* How It Works Section */}
            <HowItWorks />

            {/* Testimonials Section */}
            <Testimonials />

            {/* Footer */}
        </div>
    );
};

export default CompletePage;