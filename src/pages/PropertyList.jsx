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

  // Scroll to property list
  useEffect(() => {
    if (search && propertyListRef.current) {
      setTimeout(() => {
        const element = propertyListRef.current;
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - (window.innerHeight * 0.4);
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [search]);

  useEffect(() => {
    if (categoryFilter && propertyListRef.current) {
      setTimeout(() => {
        propertyListRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [categoryFilter]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: propertyListRef.current?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
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
  };

  const clearCategoryFilter = () => {
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(categoryFilter === category ? "" : category);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      scrollToTop();
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
      {/* Hero Section - Black & White */}
      <div className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Glowing Orbs - Gray Scale */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gray-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Building Illustration - Black & White */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
          <svg viewBox="0 0 800 400" className="w-full h-auto opacity-30">
            {/* Main Building */}
            <rect x="250" y="100" width="150" height="300" fill="url(#buildingGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            {/* Windows */}
            {[...Array(8)].map((_, i) => (
              <g key={i}>
                <rect x="270" y={120 + i * 35} width="25" height="25" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}/>
                <rect x="310" y={120 + i * 35} width="25" height="25" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.1}s` }}/>
                <rect x="350" y={120 + i * 35} width="25" height="25" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.05}s` }}/>
              </g>
            ))}
            
            {/* Left Building */}
            <rect x="90" y="180" width="120" height="220" fill="url(#buildingGradient2)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
            {[...Array(6)].map((_, i) => (
              <g key={`left-${i}`}>
                <rect x="115" y={200 + i * 35} width="20" height="20" fill="rgba(255,255,255,0.6)" className="animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}/>
                <rect x="155" y={200 + i * 35} width="20" height="20" fill="rgba(255,255,255,0.6)" className="animate-pulse" style={{ animationDelay: `${i * 0.3 + 0.15}s` }}/>
              </g>
            ))}

            {/* Right Building */}
            <rect x="430" y="150" width="130" height="250" fill="url(#buildingGradient3)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
            {[...Array(7)].map((_, i) => (
              <g key={`right-${i}`}>
                <rect x="445" y={170 + i * 35} width="22" height="22" fill="rgba(255,255,255,0.7)" className="animate-pulse" style={{ animationDelay: `${i * 0.25}s` }}/>
                <rect x="485" y={170 + i * 35} width="22" height="22" fill="rgba(255,255,255,0.7)" className="animate-pulse" style={{ animationDelay: `${i * 0.25 + 0.12}s` }}/>
                <rect x="525" y={170 + i * 35} width="22" height="22" fill="rgba(255,255,255,0.7)" className="animate-pulse" style={{ animationDelay: `${i * 0.25 + 0.08}s` }}/>
              </g>
            ))}

            <defs>
              <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(107,114,128,0.8)"/>
                <stop offset="100%" stopColor="rgba(55,65,81,0.9)"/>
              </linearGradient>
              <linearGradient id="buildingGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(75,85,99,0.7)"/>
                <stop offset="100%" stopColor="rgba(55,65,81,0.8)"/>
              </linearGradient>
              <linearGradient id="buildingGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(55,65,81,0.7)"/>
                <stop offset="100%" stopColor="rgba(31,41,55,0.8)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Top 25% - Hero Text */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-gray-300 font-serif font-semibold text-xs sm:text-sm tracking-widest">PREMIUM REAL ESTATE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-4 sm:mb-6 text-white leading-tight px-2 tracking-tight">
                Your Land,
                <span className="block bg-gradient-to-r from-gray-300 via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Our Commitment
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-serif font-light tracking-wider mb-6 sm:mb-8 px-4">
                A Vision Realized, Clear titled PROPERTIES
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-2">
                <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{totalCount}+</div>
                  <div className="text-xs sm:text-sm text-gray-300 font-serif tracking-wide">Properties</div>
                </div>
                <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{getCities().length}+</div>
                  <div className="text-xs sm:text-sm text-gray-300 font-serif tracking-wide">Cities</div>
                </div>
                <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-white">100%</div>
                  <div className="text-xs sm:text-sm text-gray-300 font-serif tracking-wide">Verified</div>
                </div>
              </div>
            </div>

            {/* Bottom 25% - Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50">
                <div className="relative">
                  <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 lg:py-5 text-base sm:text-lg border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-500 transition-all bg-white font-serif"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchSubmit}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                  <button 
                    onClick={() => handleCategorySelect("Commercial")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "Commercial" 
                        ? "bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-700" 
                        : "bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600"
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
                        ? "bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-700" 
                        : "bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600"
                    }`}
                  >
                    <LandPlot className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    Outright
                  </button>
                  <button 
                    onClick={() => handleCategorySelect("Farmland")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "Farmland" 
                        ? "bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-700" 
                        : "bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600"
                    }`}
                  >
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    Farmland
                  </button>
                  <button 
                    onClick={() => handleCategorySelect("JD/JV")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-serif font-semibold shadow-lg text-xs sm:text-base tracking-wide ${
                      categoryFilter === "JD/JV" 
                        ? "bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-700" 
                        : "bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600"
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
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
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
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-serif font-medium tracking-wide"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Active Category Filter Display */}
            {categoryFilter && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg border-2 border-gray-700">
                <span className="font-serif font-medium tracking-wide">{categoryFilter}</span>
                <button
                  onClick={clearCategoryFilter}
                  className="ml-2 p-1 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Clear All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-serif font-medium tracking-wide"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <select
              className="border-2 border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all shadow-sm font-serif font-medium tracking-wide"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="displayOrder">Featured Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border-2 border-gray-300">
              <button
                className={`px-4 py-2 rounded-lg transition-all font-serif font-medium ${
                  viewMode === "grid" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-all font-serif font-medium ${
                  viewMode === "list" ? "bg-gray-900 text-white shadow" : "text-gray-600 hover:bg-gray-100"
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-gray-900 tracking-tight">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-serif"
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
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-serif"
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
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-serif font-medium tracking-wide"
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
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400"
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
                          ? "bg-gray-900 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 hover:border-gray-400"
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
                          ? "bg-gray-900 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 hover:border-gray-400"
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
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400"
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
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 font-serif"
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
                  className={`px-4 py-2 rounded-lg font-medium font-serif ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "bg-gray-900 text-white"
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
                  className={`px-4 py-2 rounded-lg font-medium font-serif ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "bg-gray-900 text-white"
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