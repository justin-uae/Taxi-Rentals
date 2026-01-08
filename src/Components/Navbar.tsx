import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Check if link is active
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    // Close mobile menu when clicking a link
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = import.meta.env.VITE_CONTACT_NUMBER;
        const message = 'Hello! I would like to inquire about your Taxi rides.';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center space-x-2 group"
                            onClick={handleLinkClick}
                        >
                            <h1 className="text-lg sm:text-xl font-bold text-white">
                                Dubai<span className="text-orange-400">Cab</span>
                            </h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-8">
                            <Link
                                to="/"
                                className={`font-medium transition-colors relative py-1 ${isActive('/')
                                    ? 'text-orange-400'
                                    : 'text-gray-300 hover:text-orange-400'
                                    }`}
                            >
                                Home
                                {isActive('/') && (
                                    <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-orange-400"></span>
                                )}
                            </Link>
                            <Link
                                to="/fleet"
                                className={`font-medium transition-colors relative py-1 ${isActive('/fleet')
                                    ? 'text-orange-400'
                                    : 'text-gray-300 hover:text-orange-400'
                                    }`}
                            >
                                Our Fleets
                                {isActive('/fleet') && (
                                    <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-orange-400"></span>
                                )}
                            </Link>
                            <Link
                                to="/about"
                                className={`font-medium transition-colors relative py-1 ${isActive('/about')
                                    ? 'text-orange-400'
                                    : 'text-gray-300 hover:text-orange-400'
                                    }`}
                            >
                                About Us
                                {isActive('/about') && (
                                    <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-orange-400"></span>
                                )}
                            </Link>

                            <Link
                                to="/contact"
                                className={`font-medium transition-colors relative py-1 ${isActive('/contact')
                                    ? 'text-orange-400'
                                    : 'text-gray-300 hover:text-orange-400'
                                    }`}
                            >
                                Contact
                                {isActive('/contact') && (
                                    <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-orange-400"></span>
                                )}
                            </Link>

                            <button
                                onClick={handleWhatsAppClick}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-4 lg:px-6 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                            >
                                <FaWhatsapp className="w-4 h-4 lg:w-5 lg:h-5" />
                                <span className="hidden lg:inline">Connect on WhatsApp</span>
                                <span className="lg:hidden">WhatsApp</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden text-gray-300 hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden pb-4 border-t border-gray-800 animate-slideDown">
                            <div className="flex flex-col space-y-1 pt-4">
                                <Link
                                    to="/"
                                    onClick={handleLinkClick}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${isActive('/')
                                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-orange-400'
                                        }`}
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/about"
                                    onClick={handleLinkClick}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${isActive('/about')
                                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-orange-400'
                                        }`}
                                >
                                    About Us
                                </Link>

                                <Link
                                    to="/contact"
                                    onClick={handleLinkClick}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${isActive('/contact')
                                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-orange-400'
                                        }`}
                                >
                                    Contact
                                </Link>

                                <div className="pt-4 px-4">
                                    <button
                                        onClick={() => {
                                            handleWhatsAppClick();
                                            handleLinkClick();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-3 rounded-full transition-all shadow-lg text-sm"
                                    >
                                        <FaWhatsapp className="w-5 h-5" />
                                        <span>Connect on WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default Navbar;