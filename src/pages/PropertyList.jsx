import { useEffect, useState, useRef } from "react";
import { Search, SlidersHorizontal, Grid3x3, List, MapPin, Home, DollarSign, Maximize, Building, Sprout, Handshake, LandPlot, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getProperties } from "../api/axios";
import PropertyCard from "../components/PropertyCard";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [areaRange, setAreaRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("displayOrder");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(12); // Items per page
  
  // Ref for the property listings section
  const propertyListRef = useRef(null);

  // Fetch properties with pagination
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        category: categoryFilter || undefined,
        city: cityFilter || undefined,
        search: search || undefined,
        sortBy: getSortField(sort),
        sortOrder: getSortOrder(sort),
        minPrice: getMinPrice(priceRange),
        maxPrice: getMaxPrice(priceRange)
      };
      
      const response = await getProperties(params);
      setProperties(response.data.properties || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.total || 0);
      setError("");
    } catch (err) {
      setError("Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchProperties();
  }, [categoryFilter, cityFilter, priceRange, areaRange, search, sort]);

  // Fetch properties when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchProperties();
    }
  }, [currentPage]);

  // Initial fetch
  useEffect(() => {
    fetchProperties();
  }, []);

  // Helper functions for sorting
  const getSortField = (sortValue) => {
    switch(sortValue) {
      case "displayOrder": return "displayOrder";
      case "newest": return "createdAt";
      case "oldest": return "createdAt";
      case "name": return "title";
      case "price-low": return "price";
      case "price-high": return "price";
      case "area-low": return "attributes.square";
      case "area-high": return "attributes.square";
      default: return "displayOrder";
    }
  };

  const getSortOrder = (sortValue) => {
    switch(sortValue) {
      case "newest":
      case "price-high":
      case "area-high":
        return "desc";
      case "oldest":
      case "price-low":
      case "area-low":
      case "name":
      case "displayOrder":
      default:
        return "asc";
    }
  };

  // Price range helpers
  const getMinPrice = (range) => {
    switch(range) {
      case "0-50": return 0;
      case "50-100": return 5000000;
      case "100-200": return 10000000;
      case "200+": return 20000000;
      default: return undefined;
    }
  };

  const getMaxPrice = (range) => {
    switch(range) {
      case "0-50": return 5000000;
      case "50-100": return 10000000;
      case "100-200": return 20000000;
      case "200+": return 1000000000;
      default: return undefined;
    }
  };

  // Scroll to property list function
  const scrollToPropertyList = () => {
    setTimeout(() => {
      if (propertyListRef.current) {
        propertyListRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Scroll when category changes - FIXED VERSION
  useEffect(() => {
    if (categoryFilter && propertyListRef.current) {
      scrollToPropertyList();
    }
  }, [categoryFilter]);

  // Scroll when search changes
  useEffect(() => {
    if (search && propertyListRef.current) {
      scrollToPropertyList();
    }
  }, [search]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToPropertyList();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToPropertyList();
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    scrollToPropertyList();
  };

  // Filter handlers
  const clearFilters = () => {
    setSearch("");
    setSort("displayOrder");
    setCategoryFilter("");
    setCityFilter("");
    setPriceRange("");
    setAreaRange("");
    setCurrentPage(1);
    setShowFilters(false);
    scrollToPropertyList();
  };

  const clearCategoryFilter = () => {
    setCategoryFilter("");
    setCurrentPage(1);
    scrollToPropertyList();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // FIXED: Category select with immediate scroll
  const handleCategorySelect = (category) => {
    const newCategory = categoryFilter === category ? "" : category;
    setCategoryFilter(newCategory);
    setCurrentPage(1);
    // Immediate scroll
    setTimeout(() => {
      scrollToPropertyList();
    }, 50);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      scrollToPropertyList();
    }
  };

  const getCities = () => {
    const cities = properties.map(p => p.city).filter(Boolean);
    return [...new Set(cities)];
  };

  const activeFiltersCount = [categoryFilter, cityFilter, priceRange, areaRange].filter(Boolean).length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Commercial": return <Building className="w-4 h-4" />;
      case "Farmland": return <Sprout className="w-4 h-4" />;
      case "JD/JV": return <Handshake className="w-4 h-4" />;
      case "Outright": return <LandPlot className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light tracking-wide">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 tracking-tight">Error Loading Properties</h2>
          <p className="text-gray-600 mb-6 font-light">{error}</p>
          <button
            onClick={fetchProperties}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md font-serif font-medium tracking-wide"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Black & White with Animated Background */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Glowing Orbs - Black & White Theme */}
        <div className="absolute top-4 sm:top-8 md:top-10 lg:top-12 xl:top-14 left-2 sm:left-4 md:left-6 lg:left-8 xl:left-10 
                w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 
                bg-gray-600 rounded-full filter blur-3xl opacity-20 sm:opacity-25 animate-pulse"></div>
        <div className="absolute bottom-4 sm:bottom-8 md:bottom-10 lg:bottom-12 xl:bottom-14 right-2 sm:right-4 md:right-6 lg:right-8 xl:right-10 
                w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 
                bg-gray-500 rounded-full filter blur-3xl opacity-20 sm:opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Animated Clouds - Black & White */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Cloud 1 */}
          <svg className="absolute top-8 sm:top-10 md:top-12 lg:top-14 xl:top-16 
                  w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 
                  opacity-30 sm:opacity-35" 
               viewBox="0 0 250 80" 
               style={{ left: '-15%' }}>
            <defs>
              <filter id="cloud-blur-1-bw">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
            </defs>
            <g filter="url(#cloud-blur-1-bw)">
              <ellipse cx="60" cy="45" rx="45" ry="28" fill="white" className="opacity-60 sm:opacity-65"/>
              <ellipse cx="95" cy="38" rx="38" ry="25" fill="white" className="opacity-50 sm:opacity-55"/>
              <ellipse cx="125" cy="42" rx="35" ry="22" fill="white" className="opacity-55 sm:opacity-60"/>
              <ellipse cx="75" cy="52" rx="32" ry="20" fill="white" className="opacity-45 sm:opacity-50"/>
              <ellipse cx="105" cy="50" rx="40" ry="26" fill="white" className="opacity-50 sm:opacity-55"/>
              <ellipse cx="140" cy="48" rx="30" ry="18" fill="white" className="opacity-40 sm:opacity-45"/>
            </g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 0" dur="50s" repeatCount="indefinite"/>
          </svg>

          {/* Cloud 2 */}
          <svg className="absolute top-20 sm:top-24 md:top-28 lg:top-32 xl:top-36 
                  w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 
                  opacity-25 sm:opacity-30" 
               viewBox="0 0 280 90" 
               style={{ right: '-20%' }}>
            <defs>
              <filter id="cloud-blur-2-bw">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              </filter>
            </defs>
            <g filter="url(#cloud-blur-2-bw)">
              <ellipse cx="65" cy="50" rx="50" ry="30" fill="white" className="opacity-55 sm:opacity-60"/>
              <ellipse cx="105" cy="42" rx="42" ry="26" fill="white" className="opacity-60 sm:opacity-65"/>
              <ellipse cx="140" cy="48" rx="45" ry="28" fill="white" className="opacity-50 sm:opacity-55"/>
              <ellipse cx="80" cy="58" rx="38" ry="24" fill="white" className="opacity-45 sm:opacity-50"/>
              <ellipse cx="115" cy="55" rx="36" ry="22" fill="white" className="opacity-50 sm:opacity-55"/>
              <ellipse cx="150" cy="52" rx="32" ry="20" fill="white" className="opacity-40 sm:opacity-45"/>
              <ellipse cx="95" cy="48" rx="28" ry="18" fill="white" className="opacity-45 sm:opacity-50"/>
            </g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-2200 0" dur="60s" repeatCount="indefinite"/>
          </svg>

          {/* Cloud 3 */}
          <svg className="absolute top-36 sm:top-40 md:top-44 lg:top-48 xl:top-52 
                  w-44 sm:w-52 md:w-60 lg:w-68 xl:w-76 
                  opacity-28 sm:opacity-33" 
               viewBox="0 0 260 85" 
               style={{ left: '-18%' }}>
            <defs>
              <filter id="cloud-blur-3-bw">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
              </filter>
            </defs>
            <g filter="url(#cloud-blur-3-bw)">
              <ellipse cx="70" cy="48" rx="48" ry="30" fill="white" className="opacity-58 sm:opacity-63"/>
              <ellipse cx="110" cy="40" rx="40" ry="24" fill="white" className="opacity-52 sm:opacity-57"/>
              <ellipse cx="140" cy="45" rx="38" ry="26" fill="white" className="opacity-48 sm:opacity-53"/>
              <ellipse cx="85" cy="55" rx="35" ry="22" fill="white" className="opacity-50 sm:opacity-55"/>
              <ellipse cx="120" cy="52" rx="42" ry="28" fill="white" className="opacity-55 sm:opacity-60"/>
              <ellipse cx="155" cy="50" rx="28" ry="18" fill="white" className="opacity-42 sm:opacity-47"/>
            </g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="2100 0" dur="70s" repeatCount="indefinite"/>
          </svg>
        </div>

        {/* Flying Birds - Black & White */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Bird 1 */}
          <svg className="absolute top-12 sm:top-16 md:top-20 lg:top-24 xl:top-28 
                  w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" 
               viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
            <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                  stroke="white" 
                  strokeWidth="1.2 sm:stroke-width-1.4 md:stroke-width-1.5" 
                  strokeLinecap="round" 
                  className="opacity-60 sm:opacity-65 md:opacity-70">
              <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.5s" repeatCount="indefinite"/>
            </path>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="1800 -30" dur="40s" repeatCount="indefinite"/>
          </svg>

          {/* Bird 2 */}
          <svg className="absolute top-28 sm:top-32 md:top-36 lg:top-40 xl:top-44 
                  w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" 
               viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
            <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                  stroke="white" 
                  strokeWidth="1.1 sm:stroke-width-1.3 md:stroke-width-1.5" 
                  strokeLinecap="round" 
                  className="opacity-55 sm:opacity-58 md:opacity-60">
              <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.4s" repeatCount="indefinite"/>
            </path>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-1900 -20" dur="45s" repeatCount="indefinite"/>
          </svg>

          {/* Bird 3 */}
          <svg className="absolute top-16 sm:top-20 md:top-24 lg:top-28 xl:top-32 
                  w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" 
               viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
            <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                  stroke="white" 
                  strokeWidth="1.1 sm:stroke-width-1.3 md:stroke-width-1.5" 
                  strokeLinecap="round" 
                  className="opacity-45 sm:opacity-48 md:opacity-50">
              <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.45s" repeatCount="indefinite"/>
            </path>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 -40" dur="52s" repeatCount="indefinite"/>
          </svg>
        </div>

        {/* City Skyline Silhouette - Black & White */}
        <div className="absolute bottom-0 left-0 right-0 w-full opacity-20">
          <svg viewBox="0 0 600 200" className="w-full h-auto" preserveAspectRatio="xMidYMid slice">
            {/* Trees on left */}
            <circle cx="15" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
            <rect x="12" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="35" cy="175" r="10" fill="rgba(255,255,255,0.8)"/>
            <rect x="32" y="175" width="6" height="25" fill="rgba(255,255,255,0.8)"/>
            
            {/* Building 1 - Short left */}
            <rect x="50" y="120" width="40" height="80" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(8)].map((_, i) => (
                <g key={`b1-${i}`}>
                  <rect x="55" y={125 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="63" y={125 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="71" y={125 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="79" y={125 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 2 - Curved top */}
            <path d="M 95 90 Q 115 85 135 90 L 135 200 L 95 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(11)].map((_, i) => (
                <g key={`b2-${i}`}>
                  <rect x="100" y={95 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="110" y={95 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="120" y={95 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 3 - Tall antenna tower */}
            <rect x="145" y="60" width="15" height="140" fill="rgba(255,255,255,0.9)"/>
            <rect x="150" y="40" width="5" height="25" fill="rgba(255,255,255,0.9)"/>
            <circle cx="152.5" cy="38" r="3" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(14)].map((_, i) => (
                <rect key={`b3-${i}`} x="148" y={65 + i * 10} width="9" height="6" fill="rgba(150,150,150,0.6)"/>
              ))}
            </g>
            
            {/* Building 4 - Medium */}
            <rect x="165" y="110" width="30" height="90" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(9)].map((_, i) => (
                <g key={`b4-${i}`}>
                  <rect x="169" y={115 + i * 10} width="4" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="176" y={115 + i * 10} width="4" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="183" y={115 + i * 10} width="4" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 5 - Tallest center */}
            <rect x="200" y="20" width="50" height="180" fill="rgba(255,255,255,0.95)"/>
            <g>
              {[...Array(18)].map((_, i) => (
                <g key={`b5-${i}`}>
                  <rect x="205" y={25 + i * 10} width="6" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="214" y={25 + i * 10} width="6" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="223" y={25 + i * 10} width="6" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="232" y={25 + i * 10} width="6" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 6 - Diagonal top */}
            <path d="M 255 50 L 295 70 L 295 200 L 255 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(13)].map((_, i) => (
                <g key={`b6-${i}`}>
                  <rect x="260" y={75 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="268" y={75 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="276" y={75 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 7 - Small with horizontal lines */}
            <rect x="300" y="130" width="35" height="70" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(14)].map((_, i) => (
                <rect key={`b7-${i}`} x="303" y={133 + i * 5} width="29" height="2" fill="rgba(150,150,150,0.5)"/>
              ))}
            </g>
            
            {/* Building 8 - Stepped top */}
            <rect x="340" y="80" width="40" height="120" fill="rgba(255,255,255,0.9)"/>
            <rect x="345" y="65" width="30" height="15" fill="rgba(255,255,255,0.9)"/>
            <rect x="350" y="55" width="20" height="10" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(12)].map((_, i) => (
                <g key={`b8-${i}`}>
                  <rect x="345" y={85 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="353" y={85 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="361" y={85 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="369" y={85 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 9 - Tall right */}
            <rect x="385" y="40" width="45" height="160" fill="rgba(255,255,255,0.95)"/>
            <g>
              {[...Array(16)].map((_, i) => (
                <g key={`b9-${i}`}>
                  <rect x="390" y={45 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="398" y={45 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="406" y={45 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="414" y={45 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                  <rect x="422" y={45 + i * 10} width="5" height="6" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 10 - Modern slanted */}
            <path d="M 435 90 L 470 70 L 470 200 L 435 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(13)].map((_, i) => (
                <g key={`b10-${i}`}>
                  <rect x="440" y={95 + i * 8} width="5" height="5" fill="rgba(150,150,150,0.6)"/>
                  <rect x="448" y={90 + i * 8} width="5" height="5" fill="rgba(150,150,150,0.6)"/>
                  <rect x="456" y={85 + i * 8} width="5" height="5" fill="rgba(150,150,150,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Trees on right */}
            <circle cx="485" cy="178" r="11" fill="rgba(255,255,255,0.8)"/>
            <rect x="482" y="178" width="6" height="22" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="505" cy="175" r="13" fill="rgba(255,255,255,0.8)"/>
            <rect x="501" y="175" width="8" height="25" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="530" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
            <rect x="527" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
            <circle cx="560" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
            <rect x="557" y="185" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-6 sm:mb-10 lg:mb-12">
              <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-gray-300 font-serif font-semibold text-xs sm:text-sm tracking-widest">PREMIUM REAL ESTATE</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-4 sm:mb-6 text-white leading-tight px-2 tracking-tight">
                Your Land,
                <span className="block bg-gradient-to-r from-gray-300 via-gray-200 to-gray-400 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Our Commitment
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-serif font-light tracking-wider mb-6 sm:mb-8 px-4">
                A Vision Realized, Clear titled PROPERTIES
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-white">{totalCount}+</div>
                  <div className="text-xs sm:text-xs lg:text-sm text-gray-300 font-serif tracking-wide">Properties</div>
                </div>
                
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-white">{getCities().length}+</div>
                  <div className="text-xs sm:text-xs lg:text-sm text-gray-300 font-serif tracking-wide">Cities</div>
                </div>
                
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-white">100%</div>
                  <div className="text-xs sm:text-xs lg:text-sm text-gray-300 font-serif tracking-wide">Verified</div>
                </div>
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/30 hover:shadow-3xl transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search properties..."
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 lg:py-5 text-base sm:text-lg border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-500 transition-all bg-white font-serif"
                        value={search}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchSubmit}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      scrollToPropertyList();
                    }}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950 text-white px-6 sm:px-8 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-serif font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Search
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                  <button 
                    onClick={() => handleCategorySelect("Commercial")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "Commercial" 
                        ? "bg-gradient-to-r from-gray-900 to-gray-950 text-white hover:from-gray-950 hover:to-gray-900 border-2 border-gray-700 transform scale-105" 
                        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600"
                    }`}
                  >
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Commercial</span>
                    <span className="sm:hidden">Commercial.</span>
                  </button>
                  <button 
                    onClick={() => handleCategorySelect("Outright")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "Outright" 
                        ? "bg-gradient-to-r from-gray-900 to-gray-950 text-white hover:from-gray-950 hover:to-gray-900 border-2 border-gray-700 transform scale-105" 
                        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600"
                    }`}
                  >
                    <LandPlot className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    Outright
                  </button>
                  <button 
                    onClick={() => handleCategorySelect("Farmland")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "Farmland" 
                        ? "bg-gradient-to-r from-gray-900 to-gray-950 text-white hover:from-gray-950 hover:to-gray-900 border-2 border-gray-700 transform scale-105" 
                        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600"
                    }`}
                  >
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    Farmland
                  </button>
                  <button 
                    onClick={() => handleCategorySelect("JD/JV")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "JD/JV" 
                        ? "bg-gradient-to-r from-gray-900 to-gray-950 text-white hover:from-gray-950 hover:to-gray-900 border-2 border-gray-700 transform scale-105" 
                        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600"
                    }`}
                  >
                    <Handshake className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    JD/JV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
        </div>
      </div>

      {/* Property Listings Section with Ref */}
      <div ref={propertyListRef} className="max-w-7xl mx-auto px-4 py-12">
        {/* Active Filters and Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Toggle */}
            <button
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-serif font-medium tracking-wide hover:shadow-md hover:border-gray-400 transition-all duration-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Active Category Filter Display */}
            {categoryFilter && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all duration-300">
                <span className="font-serif font-medium tracking-wide">{categoryFilter}</span>
                <button
                  onClick={clearCategoryFilter}
                  className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Clear All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-serif font-medium tracking-wide hover:shadow-sm border border-gray-300 hover:border-gray-400"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <select
              className="border-2 border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all shadow-sm font-serif font-medium tracking-wide hover:border-gray-400 hover:shadow-md"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="displayOrder">Featured Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border-2 border-gray-300 hover:border-gray-400 transition-all duration-300">
              <button
                className={`px-4 py-2 rounded-lg transition-all font-serif font-medium ${
                  viewMode === "grid" ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-all font-serif font-medium ${
                  viewMode === "list" ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-gray-900 tracking-tight">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-100 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-serif font-medium text-gray-700 mb-2 tracking-wide">
                  <Home className="w-4 h-4 inline mr-1" />
                  Property Type
                </label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-serif hover:border-gray-400"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {["Outright", "Commercial", "Farmland", "JD/JV"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-serif font-medium text-gray-700 mb-2 tracking-wide">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-serif hover:border-gray-400"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {getCities().map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-tight">
            Discover Premium Properties
          </h2>
          <p className="text-gray-600 font-serif tracking-wide">
            Showing {properties.length} of {totalCount} properties
            {activeFiltersCount > 0 && " (filtered)"}
            <span className="text-gray-900 font-bold ml-2">• Page {currentPage} of {totalPages}</span>
          </p>
        </div>

        {/* Loading Spinner for Page Changes */}
        {loading && currentPage > 1 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600 font-serif tracking-wide">Loading properties...</p>
          </div>
        )}

        {/* Property Cards */}
        {!loading || currentPage === 1 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {properties.filter(property => property && property._id).map((property) => (
              <PropertyCard 
                key={property._id || property.id} 
                property={property} 
                viewMode={viewMode}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        ) : null}

        {/* No results message */}
        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-gray-700 mb-2 tracking-tight">No properties found</h3>
            <p className="text-gray-500 mb-4 font-serif tracking-wide">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-gray-950 transition-colors font-serif font-medium tracking-wide hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination Component */}
        {totalPages > 1 && !loading && properties.length > 0 && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-serif tracking-wide">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} properties
              </div>
              
              <nav className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 sm:p-3 rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all font-serif ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all font-serif ${
                        currentPage === totalPages
                          ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 sm:p-3 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-serif tracking-wide">Go to:</span>
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 font-serif hover:border-gray-400"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Mobile-friendly pagination */}
            <div className="mt-6 sm:hidden">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium font-serif transition-all ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-gray-950 hover:shadow-lg"
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 font-serif">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium font-serif transition-all ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-gray-950 hover:shadow-lg"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}