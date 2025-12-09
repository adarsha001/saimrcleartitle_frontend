import React, { useState } from 'react';
import { createEnquiry } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { trackClickPublic } from '../api/clickTracker';

const EnquiryForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [clickedItem, setClickedItem] = useState(null);

  // Enhanced handleClick function
  const handleClick = async (itemType, itemValue, displayName = null, url = null) => {
    const itemKey = `${itemType}-${itemValue}`;
    setClickedItem(itemKey);
    
    // Track the click using enhanced public API
    await trackClickPublic({
      itemType,
      itemValue,
      displayName: displayName || `${itemType}: ${itemValue}`,
      propertyId: null
    });

    // If there's a URL, open it
    if (url) {
      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }

    // Reset animation after 1 second
    setTimeout(() => setClickedItem(null), 1000);
  };

  // Contact methods with tracking
  const contactMethods = [
    {
      type: 'phone',
      value: '+917788999022',
      displayName: 'Primary Phone',
      url: 'tel:+917788999022',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
      )
    },
    {
      type: 'whatsapp',
      value: '+917788999022',
      displayName: 'WhatsApp',
      url: 'https://wa.me/917788999022',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )
    },
    {
      type: 'email',
      value: 'saimrgroups@gmail.com',
      displayName: 'Email',
      url: 'mailto:saimrgroups@gmail.com',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      )
    }
  ];

  // Auto-fill form when user logs in, but don't lock the fields
  React.useEffect(() => {
    if (isAuthenticated && user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phoneNumber: user.phoneNumber || prev.phoneNumber
      }));
    }
  }, [isAuthenticated, user, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const enquiryData = {
        ...formData,
        userId: isAuthenticated ? user.id : null
      };

      const response = await createEnquiry(enquiryData);
      
      if (response.data.success) {
        setSubmitMessage('Thank you! Your enquiry has been submitted successfully.');
        // Reset form
        setFormData({
          name: '',
          phoneNumber: '',
          message: ''
        });
        // Close form after successful submission
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, there was an error submitting your enquiry. Please try again.';
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill button handler
  const handleAutoFill = () => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phoneNumber: user.phoneNumber || prev.phoneNumber
      }));
    }
  };

  const toggleForm = () => {
    setIsOpen(!isOpen);
    setSubmitMessage(''); // Clear messages when toggling
  };

  return (
    <div className="fixed top-1/12 right-4 transform -translate-y-1/12 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleForm}
          className="bg-black text-white px-4 py-3 md:px-6 md:py-3 rounded-lg shadow-2xl border border-gray-800 hover:bg-gray-900 transition duration-200 font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {/* Hide text on mobile, show on medium screens and up */}
          <span className="hidden md:inline">Get In Touch</span>
        </button>
      )}

      {/* Enquiry Form */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-4 md:p-6 w-80 max-w-[90vw]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              Get In Touch
            </h3>
            <button
              onClick={toggleForm}
              className="text-gray-500 hover:text-gray-700 transition duration-200"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 text-xs md:text-sm mb-4 md:mb-6">
            Have questions? We'd love to hear from you.
          </p>
          
          {/* Quick Contact Buttons */}
          <div className="flex justify-between space-x-2 mb-4">
            {contactMethods.map((contact) => (
              <button
                key={contact.type}
                onClick={() => handleClick(contact.type, contact.value, contact.displayName, contact.url)}
                className={`flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-all duration-300 text-xs font-medium ${
                  clickedItem === `${contact.type}-${contact.value}` ? 'bg-gray-300 scale-95' : ''
                }`}
              >
                {contact.icon}
                <span className="hidden sm:inline">
                  {contact.type === 'phone' ? 'Call' : contact.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </span>
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-xs md:text-sm flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Welcome back, {user.name}!
                </span>
                <button
                  onClick={handleAutoFill}
                  className="text-gray-700 hover:text-gray-900 text-xs font-medium underline"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                placeholder="Please describe your enquiry in detail..."
                required
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Enquiry'
              )}
            </button>

            {submitMessage && (
              <div className={`p-2 md:p-3 rounded-lg text-xs md:text-sm text-center ${
                submitMessage.includes('error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {submitMessage}
              </div>
            )}
          </form>

          {/* Alternative Contact Methods */}
          {/* <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-gray-600 text-xs text-center mb-2">
              Prefer to contact directly?
            </p>
            <div className="flex justify-center space-x-4">
              {contactMethods.map((contact) => (
                <button
                  key={contact.type}
                  onClick={() => handleClick(contact.type, contact.value, contact.displayName, contact.url)}
                  className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-all duration-300 text-xs ${
                    clickedItem === `${contact.type}-${contact.value}` ? 'text-black font-semibold scale-105' : ''
                  }`}
                >
                  {contact.icon}
                  <span>
                    {contact.type === 'phone' ? 'Call' : contact.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                  </span>
                </button>
              ))}
            </div>
          </div> */}

          {!isAuthenticated && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-300">
              <p className="text-gray-600 text-xs md:text-sm text-center">
                <a 
                  href="/login" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition duration-200 inline-flex items-center"
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Log in for faster enquiry
                </a>
              </p>
              <p className="text-gray-500 text-xs text-center mt-1">
                Auto-fill your details for future enquiries
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnquiryForm;