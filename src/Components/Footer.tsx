import React from 'react';
import { Mail, Phone, MapPin, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentMethods from '../assets/payment.png'
import Logo from '../assets/Logo5.png'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Our Fleets', href: '/fleet' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const phoneNumber = import.meta.env.VITE_CONTACT_NUMBER;
    const phoneNumber2 = import.meta.env.VITE_CONTACT_NUMBER_SECOND;
    const companyEmail = import.meta.env.VITE_COMPANY_EMAIL;
    const appURL = import.meta.env.VITE_APP_URL;

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-10 relative overflow-hidden">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(249, 115, 22, 0.1) 20px, rgba(249, 115, 22, 0.1) 40px),
                              repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(249, 115, 22, 0.1) 20px, rgba(249, 115, 22, 0.1) 40px)`
                }}></div>
            </div>

            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Company Info */}
                    <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                        {/* Logo/Brand */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img
                                src={Logo}
                                loading='lazy'
                                alt="UAE Transfers Logo"
                                className="h-16 sm:h-16 md:h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                            />
                            <h1 className="text-lg sm:text-xl font-bold text-white">
                                UAE<span className="text-orange-400"> Transfers</span>
                            </h1>
                        </Link>

                        {/* Contact Info */}
                        <div className="flex flex-col items-center md:items-start gap-3 mt-2">
                            <div className="flex items-center gap-2 group">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                                </div>
                                <span className="text-sm text-center md:text-left font-medium">
                                    Dubai : Hor Al Anz - Building 101, Dubai, UAE
                                </span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                                </div>
                                <span className="text-sm text-center md:text-left font-medium">
                                    Abu Dhabi : Khalidiyah Towers, Corniche Road, Abu Dhabi, UAE
                                </span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <Phone className="w-4 h-4 text-white flex-shrink-0" />
                                </div>
                                <a href={`tel:+${phoneNumber}`} className="text-sm hover:text-orange-400 transition-colors font-medium">
                                    {phoneNumber},
                                </a>
                                <a href={`tel:+${phoneNumber2}`} className="text-sm hover:text-orange-400 transition-colors font-medium">
                                    {phoneNumber2}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <Mail className="w-4 h-4 text-white flex-shrink-0" />
                                </div>
                                <a href={`mailto:${companyEmail}`} className="text-sm hover:text-orange-400 transition-colors font-medium">
                                    {companyEmail}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <div>
                            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3 text-center md:text-right">
                                Quick Links
                            </h3>
                            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 sm:gap-6">
                                {quickLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="text-sm font-bold hover:text-orange-400 transition-colors relative group"
                                    >
                                        {link.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Mission Statement */}
                        <div className="text-center md:text-right max-w-md mt-4">
                            <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                                <Car className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-bold text-orange-400">Our Mission</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Providing reliable, safe, and comfortable chauffer services across UAE with exceptional customer experience.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">We Accept:</span>
                    <div className="rounded-lg p-2 shadow-md">
                        <img
                            src={PaymentMethods}
                            alt="Payment Methods: PayPal, Mastercard, Visa, Maestro, Apple Pay, Amazon Pay, Google Pay, Stripe"
                            className="w-full max-w-xs h-auto"
                        />
                    </div>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-4 my-8">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent to-orange-500/50"></div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="w-24 h-0.5 bg-gradient-to-l from-transparent to-orange-500/50"></div>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm text-gray-400 font-medium">
                        © {currentYear}{' '}
                        <a href={appURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 font-bold transition-colors"
                        >
                            UAE Transfers
                        </a>

                        {' '}• All rights reserved
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <Car className="w-4 h-4 text-orange-500" />
                        <p className="text-xs text-gray-500">Premium Transport Services • Safe & Reliable</p>
                    </div>
                </div>
            </div>

            {/* Bottom decorative border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        </footer>
    );
};

export default Footer;