import React from 'react';
import { Link } from 'react-router-dom';
import NotFoundIMG2 from '../assets/NotFoundIMG2.png';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 flex items-center justify-center px-4">
            <div className="max-w-3xl mx-auto text-center py-8">
                {/* Animated Image Container */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-full blur-2xl animate-pulse"></div>

                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                            animation: 'float 6s ease-in-out infinite',
                            filter: 'drop-shadow(0 20px 40px rgba(249, 115, 22, 0.2))'
                        }}
                    >
                        <img
                            src={NotFoundIMG2}
                            alt="404 Not Found - Lost Transport"
                            className="w-full h-full object-contain animate-wiggle"
                            style={{ animationDuration: '8s' }}
                        />

                        {/* Floating elements around the image */}
                        <div
                            className="absolute -top-4 -right-4 w-8 h-8 bg-orange-500 rounded-full opacity-20"
                            style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
                        ></div>
                        <div
                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full opacity-20"
                            style={{ animation: 'float 5s ease-in-out infinite 1s' }}
                        ></div>
                        <div
                            className="absolute top-1/2 -right-8 w-4 h-4 bg-purple-500 rounded-full opacity-20"
                            style={{ animation: 'float 3.5s ease-in-out infinite 1.5s' }}
                        ></div>
                    </div>

                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-600/0 rounded-full"
                        style={{
                            animation: 'glow 3s ease-in-out infinite alternate',
                            filter: 'blur(20px)'
                        }}
                    ></div>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-8">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 animate-fade-in">
                        404
                    </h1>
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-3xl md:text-4xl lg:text-5xl font-bold animate-fade-in">
                        Page Not Found
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 animate-fade-in-delay">
                        Lost in Transit
                    </p>

                    <div className="max-w-lg mx-auto pt-2">
                        <p className="text-base md:text-lg text-gray-500 leading-relaxed animate-fade-in-delay-2">
                            Looks like this page took a wrong turn. Don't worry, our cab drivers are experts at finding the right route. Let's get you back on track!
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
                    <Link
                        to="/"
                        className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-500 inline-flex items-center justify-center gap-3 overflow-hidden shadow-lg"
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                        {/* Button content */}
                        <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="relative">Navigate Home</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(2deg);
                    }
                }

                @keyframes wiggle {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    25% {
                        transform: rotate(1deg);
                    }
                    75% {
                        transform: rotate(-1deg);
                    }
                }

                @keyframes glow {
                    0% {
                        opacity: 0.3;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 0.7;
                        transform: scale(1.05);
                    }
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
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

                @keyframes fade-in-delay-3 {
                    0%, 60% {
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

                .animate-fade-in-delay-3 {
                    animation: fade-in-delay-3 1.6s ease-out forwards;
                }

                .animate-wiggle {
                    animation: wiggle 8s ease-in-out infinite;
                }

                img {
                    transition: transform 0.3s ease;
                }

                img:hover {
                    transform: scale(1.05);
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    50% {
                        transform: translateX(3px);
                    }
                }

                @media (max-width: 640px) {
                    .w-64, .h-64 {
                        width: 14rem;
                        height: 14rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotFound;