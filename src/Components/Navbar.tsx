import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                        <h1 className="text-xl font-bold text-white">
                            Dubai<span className="text-orange-400">Cab</span>
                        </h1>
                    </Link>
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className={`font-medium transition-colors relative ${isActive('/')
                                ? 'text-orange-400'
                                : 'text-gray-300 hover:text-orange-400'
                                }`}
                        >
                            Home
                            {isActive('/') && (
                                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-orange-400"></span>
                            )}
                        </Link>

                        <Link
                            to="/about"
                            className={`font-medium transition-colors relative ${isActive('/about')
                                ? 'text-orange-400'
                                : 'text-gray-300 hover:text-orange-400'
                                }`}
                        >
                            About Us
                            {isActive('/about') && (
                                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-orange-400"></span>
                            )}
                        </Link>

                        <Link
                            to="/contact"
                            className={`font-medium transition-colors relative ${isActive('/contact')
                                ? 'text-orange-400'
                                : 'text-gray-300 hover:text-orange-400'
                                }`}
                        >
                            Contact
                            {isActive('/contact') && (
                                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-orange-400"></span>
                            )}
                        </Link>

                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-2 px-6 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <User className="h-4 w-4" />
                            <span>Login / Sign Up</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-300 hover:text-orange-400 transition-colors"
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

                            <div className="pt-4">
                                <Link
                                    to="/login"
                                    onClick={handleLinkClick}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Login / Sign Up</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
        </nav>
    );
};

export default Navbar;