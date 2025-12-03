import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";
import { toast } from "react-hot-toast";
import { Building, Sprout, Handshake, LandPlot, MapPin, ExternalLink, Ruler } from "lucide-react";
import { gsap } from "gsap";

export default function PropertyCard({ property, viewMode, getCategoryIcon }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    toggleLike, 
    isPropertyLiked, 
    loading: likesLoading,
    error 
  } = useLikes();

  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Refs for GSAP animations
  const verifiedBadgeRef = useRef(null);
  const featuredBadgeRef = useRef(null);

  // Add comprehensive null checks for the property object
  if (!property || !property._id) {
    console.warn("PropertyCard: Invalid property data", property);
    return null; // Don't render if property is invalid
  }

  const {
    _id,
    title,
    city,
    category,
    images,
    attributes,
    propertyLocation,
    mapUrl,
    isVerified,
    price,
    forSale,
    isFeatured
  } = property;

  // GSAP animations for badges
  useEffect(() => {
    if (isVerified && verifiedBadgeRef.current) {
      // Staggered animation for verified badge
      const tl = gsap.timeline();
      
      tl.fromTo(verifiedBadgeRef.current, 
        { 
          scale: 0,
          rotation: -10,
          opacity: 0
        },
        { 
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );
      
      // Continuous subtle pulse animation
      tl.to(verifiedBadgeRef.current, {
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (isFeatured && featuredBadgeRef.current) {
      gsap.fromTo(featuredBadgeRef.current,
        { 
          scale: 0,
          opacity: 0,
          y: -10
        },
        { 
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isVerified, isFeatured]);

  // Add null checks for nested properties
  const safeAttributes = attributes || {};
  const safeImages = images || [];

const formatPrice = (price) => {
  // Handle "Price on Request" in any form
  const priceStr = typeof price === 'string' ? price.toLowerCase().trim() : '';
  
  if (priceStr.includes('price on request') || priceStr.includes('por')) {
    return "Price on Request";
  }

  // Handle string values
  if (typeof price === 'string') {
    // Extract only the price part (before any "|" or other separators)
    const pricePart = priceStr.split('|')[0].trim();
    
    // Check for per square foot variants
    const perSqftMatch = pricePart.match(/([\d.,]+)\s*(?:rs?|₹)?\s*\/?\s*(?:sq\s*ft|sqft|per\s*sq\s*ft|per\s*sqft)/i);
    if (perSqftMatch) {
      const numValue = parseFloat(perSqftMatch[1].replace(/,/g, ''));
      if (!isNaN(numValue)) {
        const formatted = `₹${numValue.toLocaleString("en-IN")}/sqft`;
        if (pricePart.includes('negotiable') || pricePart.includes('neg')) {
          return `${formatted} (Negotiable)`;
        }
        return formatted;
      }
    }

    // Check for "per Sqft" at the end
    const perSqftEndMatch = pricePart.match(/([\d.,]+)\s*(?:rs?|₹)?\s*per\s*sq\s*ft/i);
    if (perSqftEndMatch) {
      const numValue = parseFloat(perSqftEndMatch[1].replace(/,/g, ''));
      if (!isNaN(numValue)) {
        const formatted = `₹${numValue.toLocaleString("en-IN")}/sqft`;
        if (pricePart.includes('negotiable') || pricePart.includes('neg')) {
          return `${formatted} (Negotiable)`;
        }
        return formatted;
      }
    }

    // Check for per acre variants
    const perAcreMatch = pricePart.match(/([\d.,]+)\s*(?:rs?|₹)?\s*\/?\s*(?:acre)/i);
    if (perAcreMatch) {
      const numValue = parseFloat(perAcreMatch[1].replace(/,/g, ''));
      if (!isNaN(numValue)) {
        // Keep crores as crores for acre
        if (pricePart.includes('cr') || pricePart.includes('crore')) {
          return `₹${numValue} Cr/acre`;
        }
        // Keep lakhs as lakhs for acre
        else if (pricePart.includes('l') || pricePart.includes('lakh') || pricePart.includes('lac')) {
          return `₹${numValue} L/acre`;
        }
        else {
          const formatted = `₹${numValue.toLocaleString("en-IN")}/acre`;
          if (pricePart.includes('negotiable') || pricePart.includes('neg')) {
            return `${formatted} (Negotiable)`;
          }
          return formatted;
        }
      }
    }

    // More specific crore detection with proper number extraction
    const croreMatch = pricePart.match(/([\d.,]+)\s*(?:cr|crore)/i);
    if (croreMatch) {
      const numValue = parseFloat(croreMatch[1].replace(/,/g, ''));
      if (!isNaN(numValue)) {
        // Keep crores as crores even for acre
        if (pricePart.includes('acre')) {
          return `₹${numValue} Cr/acre`;
        }
        return `₹${numValue} Cr`;
      }
    }

    // More specific lakh detection with proper number extraction
    const lakhMatch = pricePart.match(/([\d.,]+)\s*(?:l|lakh|lac)/i);
    if (lakhMatch) {
      const numValue = parseFloat(lakhMatch[1].replace(/,/g, ''));
      if (!isNaN(numValue)) {
        // Keep lakhs as lakhs for acre
        if (pricePart.includes('acre')) {
          return `₹${numValue} L/acre`;
        }
        return `₹${numValue} L`;
      }
    }

    // Check for simple numeric values with units (more precise)
    const simpleNumberMatch = pricePart.match(/^₹?([\d.,]+)\s*(cr|crore|l|lakh|lac)?/i);
    if (simpleNumberMatch) {
      const numValue = parseFloat(simpleNumberMatch[1].replace(/,/g, ''));
      const unit = simpleNumberMatch[2] ? simpleNumberMatch[2].toLowerCase() : '';
      
      if (!isNaN(numValue)) {
        if (unit.includes('cr')) {
          return `₹${numValue} Cr`;
        } else if (unit.includes('l')) {
          return `₹${numValue} L`;
        } else {
          // No unit specified, keep as is without auto-conversion
          return `₹${numValue.toLocaleString("en-IN")}`;
        }
      }
    }

    // Check for other numeric strings with negotiable
    const numericValue = parseFloat(pricePart.replace(/[^\d.]/g, ''));
    if (!isNaN(numericValue)) {
      let formattedPrice;
      
      // Just format with commas, no unit conversion
      formattedPrice = `₹${numericValue.toLocaleString("en-IN")}`;
      
      // Check if negotiable is mentioned
      if (pricePart.includes('negotiable') || pricePart.includes('neg')) {
        return `${formattedPrice} (Negotiable)`;
      }
      return formattedPrice;
    }

    // If it's a string we can't parse, return the original price part
    return pricePart;
  }

  // Handle numeric values - just format with commas, no unit conversion
  if (typeof price === 'number') {
    return `₹${price.toLocaleString("en-IN")}`;
  }

  // Fallback for other cases
  const numericFallback = Number(price || 0);
  return `₹${numericFallback.toLocaleString("en-IN")}`;
};

  const formattedPrice = formatPrice(price);

  // Check if property is liked using global state - with null check
  const isLiked = _id ? isPropertyLiked(_id) : false;

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 3000);
      toast.error("Please login to save properties to your favorites");
      return;
    }

    // Ensure we have a valid ID before proceeding
    if (!_id) {
      toast.error("Invalid property data");
      return;
    }

    const success = await toggleLike(_id);
    
    if (success) {
      if (isLiked) {
        toast.success("Removed from favorites");
      } else {
        toast.success("Added to favorites");
      }
    } else if (error) {
      toast.error(error);
    }
  };

  const handleLikeHover = () => {
    if (!user) {
      setShowLoginTooltip(true);
    }
  };

  const handleLikeLeave = () => {
    setShowLoginTooltip(false);
  };

  // Get category-specific details with null checks
  const getCategoryDetails = () => {
    const defaultDetails = { icon: <LandPlot className="w-4 h-4" />, details: [] };
    
    if (!category) return defaultDetails;

    switch (category) {
      case "Commercial":
        return {
          icon: <Building className="w-4 h-4" />,
          details: [
            safeAttributes?.expectedROI && `ROI: ${safeAttributes.expectedROI}%`,
            safeAttributes?.floors && `${safeAttributes.floors} floors`,
            safeAttributes?.propertyLabel
          ].filter(Boolean)
        };
      case "Farmland":
        return {
          icon: <Sprout className="w-4 h-4" />,
          details: [
            safeAttributes?.irrigationAvailable && "Irrigation Available",
            safeAttributes?.waterSource,
            safeAttributes?.soilType
          ].filter(Boolean)
        };
      case "JD/JV":
        return {
          icon: <Handshake className="w-4 h-4" />,
          details: [
            safeAttributes?.typeOfJV,
            safeAttributes?.expectedROI && `Expected ROI: ${safeAttributes.expectedROI}%`,
            safeAttributes?.legalClearance && "Legal Clearance"
          ].filter(Boolean)
        };
      case "Outright":
        return {
          icon: <LandPlot className="w-4 h-4" />,
          details: [
            safeAttributes?.facing && `Facing: ${safeAttributes.facing}`,
            safeAttributes?.roadWidth && `Road: ${safeAttributes.roadWidth}ft`,
            safeAttributes?.legalClearance && "Legal Clearance"
          ].filter(Boolean)
        };
      default:
        return defaultDetails;
    }
  };

  const categoryDetails = getCategoryDetails();

  // Handle card click with null check
  const handleCardClick = () => {
    if (_id) {
      navigate(`/property/${_id}`);
    } else {
      toast.error("Invalid property data");
    }
  };

  // Enhanced Verified Badge Component
  const VerifiedBadge = ({ size = "default" }) => (
    <div
      ref={verifiedBadgeRef}
      className={`
        flex items-center gap-1.5 
        bg-gradient-to-r from-green-500 to-emerald-600 
        text-white px-3 py-2 rounded-full 
        font-semibold shadow-lg border-2 border-white/20
        backdrop-blur-sm
        ${size === "large" ? "text-sm px-4 py-2.5" : "text-xs px-3 py-2"}
      `}
    >
      <svg 
        className={size === "large" ? "w-4 h-4" : "w-3.5 h-3.5"} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Verified
    </div>
  );

  // List View Layout
  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative w-full sm:w-80 h-64 sm:h-auto overflow-hidden">
            <img
              src={safeImages[0]?.url || "https://via.placeholder.com/600x400"}
              alt={title || "Property image"}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            )}
            
            {/* Overlay Gradient - Black & White */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isVerified && <VerifiedBadge size="large" />}
              {isFeatured && (
                <div 
                  ref={featuredBadgeRef}
                  className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-white/20"
                >
                  ★ Featured
                </div>
              )}
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-gray-300">
                {getCategoryIcon ? getCategoryIcon(category) : categoryDetails.icon}
                {category || "Property"}
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              onMouseEnter={handleLikeHover}
              onMouseLeave={handleLikeLeave}
              disabled={likesLoading && user}
              className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm z-10 border border-gray-300 ${
                user 
                  ? (isLiked 
                      ? "bg-black text-white scale-110" 
                      : "bg-white/90 text-gray-700 hover:bg-white hover:scale-110 hover:border-gray-400")
                  : "bg-white/90 text-gray-500 hover:bg-white hover:scale-110 hover:border-gray-400"
              } ${(likesLoading && user) ? "opacity-50 cursor-not-allowed" : ""}`}
              title={user 
                ? (isLiked ? "Remove from favorites" : "Add to favorites") 
                : "Login to save properties"
              }
            >
              <svg
                className="w-5 h-5"
                fill={user && isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Login Tooltip */}
            {!user && showLoginTooltip && (
              <div className="absolute top-16 right-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-xl">
                Login to save properties
                <div className="absolute -top-1 right-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                {title || "Untitled Property"}
              </h3>
              
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium">{city || "Location not specified"}</span>
                {!forSale && (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    For Lease
                  </span>
                )}
              </div>

              {propertyLocation && (
                <p className="text-gray-500 text-sm mb-4 pl-6">{propertyLocation}</p>
              )}

              {/* Property Details */}
              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
                {/* Square Footage */}
                {safeAttributes?.square > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Ruler className="w-5 h-5 text-gray-700" />
                    <span className="font-semibold">{safeAttributes.square.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">acre</span>
                  </div>
                )}

                {/* Category-specific details */}
                {categoryDetails.details.slice(0, 2).map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-black text-sm font-medium hover:underline mb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Map
                </a>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <div className={`text-3xl font-bold ${
                  formattedPrice === "Price on Request" || formattedPrice === "Contact for Price"
                    ? "text-gray-600"
                    : "text-gray-900"
                }`}>
                  {formattedPrice}
                </div>
                {safeAttributes?.square > 0 && typeof price === 'number' && price > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    ₹{(price / safeAttributes.square).toFixed(0)}/acre
                  </div>
                )}
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg border border-gray-800">
                <span className="font-medium">View Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400 hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={safeImages[0]?.url || "https://via.placeholder.com/600x400"}
          alt={title || "Property image"}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
        )}
        
        {/* Overlay Gradient - Black & White */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isVerified && <VerifiedBadge />}
          {isFeatured && (
            <div 
              ref={featuredBadgeRef}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border-2 border-white/20"
            >
              ★ Featured
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg border border-gray-300">
          {getCategoryIcon ? getCategoryIcon(category) : categoryDetails.icon}
          {category || "Property"}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          onMouseEnter={handleLikeHover}
          onMouseLeave={handleLikeLeave}
          disabled={likesLoading && user}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm z-10 border border-gray-300 ${
            user 
              ? (isLiked 
                  ? "bg-red-500 text-white scale-110" 
                  : "bg-white/90 text-gray-700 hover:bg-white hover:scale-110 hover:border-gray-400")
              : "bg-white/90 text-gray-500 hover:bg-white hover:scale-110 hover:border-gray-400"
          } ${(likesLoading && user) ? "opacity-50 cursor-not-allowed" : ""}`}
          title={user 
            ? (isLiked ? "Remove from favorites" : "Add to favorites") 
            : "Login to save properties"
          }
        >
          <svg
            className="w-5 h-5"
            fill={user && isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Login Tooltip */}
        {!user && showLoginTooltip && (
          <div className="absolute bottom-14 right-3 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-xl">
            Login to save properties
            <div className="absolute -bottom-1 right-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
          </div>
        )}

        {/* Status Badge */}
        {!forSale && (
          <div className="absolute bottom-3 left-3 bg-gray-700 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
            For Lease
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[3.5rem]">
          {title || "Untitled Property"}
        </h3>
        
        <div className="flex items-center gap-1.5 text-gray-600 mb-1">
          <MapPin className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <span className="text-sm font-medium line-clamp-1">{city || "Location not specified"}</span>
        </div>

        {propertyLocation && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-1 pl-5.5">{propertyLocation}</p>
        )}

        {/* Property Details */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
          {/* Square Footage */}
          {safeAttributes?.square > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Ruler className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-semibold">{safeAttributes.square.toLocaleString()} acre</span>
            </div>
          )}

          {/* Category-specific details (first one only for grid view) */}
          {categoryDetails.details[0] && (
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-300">
              {categoryDetails.details[0]}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-2xl font-bold ${
              formattedPrice === "Price on Request" || formattedPrice === "Contact for Price"
                ? "text-gray-600"
                : "text-gray-900"
            }`}>
              {price}
            </div>
            {safeAttributes?.square > 0 && typeof price === 'number' && price > 0 && (
              <div className="text-xs text-gray-500 mt-0.5">
                ₹{(price / safeAttributes.square).toFixed(0)}/acre
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm font-medium border border-gray-800">
            <span>View</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-700 hover:text-black text-xs font-medium hover:underline w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            View on Map
          </a>
        )}
      </div>
    </div>
  );
}