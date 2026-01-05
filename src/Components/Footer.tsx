import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'About Us', href: '#' },
        { name: 'Our Fleet', href: '#' },
    ];

    const services = [
        { name: 'Airport Transfer', href: '#' },
        { name: 'Business Rentals', href: '#' },
    ];

    const support = [
        { name: 'Contact Us', href: '#' },
        { name: 'Help Center', href: '#' }
    ];

    const socialLinks = [
        { icon: <Facebook className="h-5 w-5" />, href: '#', name: 'Facebook' },
        { icon: <Twitter className="h-5 w-5" />, href: '#', name: 'Twitter' },
        { icon: <Instagram className="h-5 w-5" />, href: '#', name: 'Instagram' },
        { icon: <Linkedin className="h-5 w-5" />, href: '#', name: 'LinkedIn' },
        { icon: <Youtube className="h-5 w-5" />, href: '#', name: 'YouTube' }
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            DubaiCab
                        </h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Your trusted car rental partner since 2010. We provide premium vehicles and exceptional service across 190+ locations worldwide.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">
                                    Khalidiyah Tower, Corniche Road<br />
                                    Abu Dhabi, UAE
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                <a href="tel:+971234567890" className="text-sm hover:text-orange-500 transition-colors">
                                    +971 2 345 6789
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                <a href="mailto:info@dubaicab.com" className="text-sm hover:text-orange-500 transition-colors">
                                    info@dubaicab.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-lg">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm hover:text-orange-500 transition-colors inline-block"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-lg">
                            Services
                        </h4>
                        <ul className="space-y-2.5">
                            {services.map((service) => (
                                <li key={service.name}>
                                    <a
                                        href={service.href}
                                        className="text-sm hover:text-orange-500 transition-colors inline-block"
                                    >
                                        {service.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-lg">
                            Support
                        </h4>
                        <ul className="space-y-2.5">
                            {support.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        className="text-sm hover:text-orange-500 transition-colors inline-block"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800 bg-gray-950">
                <div className="container mx-auto px-4 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400 text-center md:text-left">
                            © {currentYear} DubaiCab. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;