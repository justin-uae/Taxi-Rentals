import React, { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle, Car, AlertCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const Contact: React.FC = () => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [responseMessage, setResponseMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const phoneNumber2 = import.meta.env.VITE_CONTACT_NUMBER_SECOND;
    const companyEmail = import.meta.env.VITE_COMPANY_EMAIL;
    const appURL = import.meta.env.VITE_APP_URL;
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }


        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Get reCAPTCHA token
        const recaptchaToken = recaptchaRef.current?.getValue();

        if (!recaptchaToken) {
            setFormStatus('error');
            setResponseMessage('Please complete the reCAPTCHA verification.');
            return;
        }

        setFormStatus('loading');
        setResponseMessage('');

        try {
            // Send form data to PHP backend
            const response = await fetch(`${appURL}/api/contact.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken: recaptchaToken
                })
            });

            const result = await response.json();

            if (result.success) {
                setFormStatus('success');
                setResponseMessage(result.message || 'Thank you! Your message has been sent successfully. We\'ll respond within 24 hours.');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
                // Reset reCAPTCHA
                recaptchaRef.current?.reset();
            } else {
                setFormStatus('error');
                setResponseMessage(result.message || 'Something went wrong. Please try again or contact us directly.');
                // Reset reCAPTCHA on error
                recaptchaRef.current?.reset();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormStatus('error');
            setResponseMessage('Network error. Please check your connection and try again.');
            recaptchaRef.current?.reset();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 pt-16">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
                            <Car className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Get In Touch</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                            Contact Us
                        </h1>
                        <p className="text-lg md:text-xl text-orange-100">
                            Have questions? We're here to help you 24/7
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-orange-100">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Send className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Send a Message</h2>
                        </div>

                        {/* Status Messages */}
                        {formStatus === 'success' && (
                            <div className="mb-6 p-5 bg-green-50 border-2 border-green-200 rounded-xl animate-slideDown">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-bold text-base">
                                        {responseMessage}
                                    </p>
                                </div>
                            </div>
                        )}
                        {formStatus === 'error' && (
                            <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-bold text-base">
                                        {responseMessage}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-black text-gray-900 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={formStatus === 'loading'}
                                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-2 transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.name
                                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                                        : 'border-orange-200 focus:ring-orange-400 focus:border-orange-400'
                                        }`}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email and Phone Row */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-black text-gray-900 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={formStatus === 'loading'}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-2 transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.email
                                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                                            : 'border-orange-200 focus:ring-orange-400 focus:border-orange-400'
                                            }`}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-black text-gray-900 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={formStatus === 'loading'}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-2 transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.phone
                                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                                            : 'border-orange-200 focus:ring-orange-400 focus:border-orange-400'
                                            }`}
                                        placeholder="+971 50 123 4567"
                                    />
                                    {errors.phone && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Field */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-black text-gray-900 mb-2">
                                    Your Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={formStatus === 'loading'}
                                    rows={6}
                                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-2 resize-none transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.message
                                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                                        : 'border-orange-200 focus:ring-orange-400 focus:border-orange-400'
                                        }`}
                                    placeholder="Please describe your inquiry in detail..."
                                />
                                {errors.message && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* reCAPTCHA v2 */}
                            {recaptchaSiteKey && (
                                <div className="flex justify-center">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={recaptchaSiteKey}
                                        theme="light"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={formStatus === 'loading'}
                                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 hover:from-orange-600 hover:via-orange-700 hover:to-orange-700 text-white font-black py-4 sm:py-5 text-base sm:text-lg rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {formStatus === 'loading' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                                        Sending Message...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                                        Send Message
                                    </>
                                )}
                            </button>

                            {/* reCAPTCHA Notice */}
                            {recaptchaSiteKey && (
                                <p className="text-xs text-gray-500 text-center font-medium">
                                    This site is protected by reCAPTCHA and the Google{' '}
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:text-orange-800 font-bold">
                                        Privacy Policy
                                    </a>{' '}
                                    and{' '}
                                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:text-orange-800 font-bold">
                                        Terms of Service
                                    </a>{' '}
                                    apply.
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Contact Info */}
                        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-orange-100">
                            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Contact Details</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl flex-shrink-0 shadow-md">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base text-gray-900 mb-1">Phone</h3>
                                        <a href={`tel:${phoneNumber2}`} className="text-sm text-orange-700 hover:text-orange-800 transition-colors break-all font-bold">
                                            +971 567 643 588
                                        </a>
                                        <br />
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl flex-shrink-0 shadow-md">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base text-gray-900 mb-1">Email</h3>
                                        <a href={`mailto:${companyEmail}`} className="text-sm text-orange-700 hover:text-orange-800 transition-colors break-all font-bold">
                                            {companyEmail}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl flex-shrink-0 shadow-md">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base text-gray-900 mb-1">Address</h3>
                                        <span className="text-sm text-center md:text-left font-medium">
                                            Dubai : Hor Al Anz - Building 101, Dubai, UAE
                                        </span>
                                        <br />
                                        <span className="text-sm text-center md:text-left font-medium">
                                            Abu Dhabi : Khalidiyah Towers, Corniche Road, UAE
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl flex-shrink-0 shadow-md">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base text-gray-900 mb-1">Support Hours</h3>
                                        <p className="text-sm text-gray-700 font-medium">24/7 Service Available</p>
                                        <p className="text-xs text-gray-600 font-medium mt-1">We're always here to help!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-orange-100 h-72 sm:h-80">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.1!2d54.365!3d24.453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDI3JzEwLjgiTiA1NMKwMjEnNTQuMCJF!5e0!3m2!1sen!2sae!4v1234567890!5m2!1sen!2sae"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Khalidiyah Tower, Corniche Road, Abu Dhabi, UAE"
                            />
                        </div>
                    </div>
                </div>

                {/* Trust Banner */}
                <div className="mt-12 sm:mt-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-10 text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(249, 115, 22, 0.1) 20px, rgba(249, 115, 22, 0.1) 40px),
                                            repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(249, 115, 22, 0.1) 20px, rgba(249, 115, 22, 0.1) 40px)`
                        }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-orange-400/30">
                            <CheckCircle className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-300 text-sm font-bold uppercase tracking-wider">Why Contact Us?</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black mb-4">We're Here to Make Your Journey Smooth</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm border border-orange-400/20 rounded-2xl p-6">
                                <div className="text-3xl font-black mb-2 text-orange-400">24/7</div>
                                <p className="text-orange-100 text-sm font-semibold">Always Available</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-orange-400/20 rounded-2xl p-6">
                                <div className="text-3xl font-black mb-2 text-orange-400">&lt; 2hrs</div>
                                <p className="text-orange-100 text-sm font-semibold">Quick Response</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-orange-400/20 rounded-2xl p-6">
                                <div className="text-3xl font-black mb-2 text-orange-400">50K+</div>
                                <p className="text-orange-100 text-sm font-semibold">Happy Customers</p>
                            </div>
                        </div>
                    </div>
                </div>
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
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Contact;