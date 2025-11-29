// components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchPendingProperties } from "../api/adminApi";
import AdminProperties from "./AdminProperties";
import AdminUsers from "./AdminUsers";
import PropertyEdit from "./PropertyEdit";
import AdminClickAnalytics from "./AdminClickAnalytics";
import ClickAnalyticsDetails from "./ClickAnalyticsDetails";
import AdminEnquiries from "./AdminEnquiries";
import { useAuth } from "../context/AuthContext";
import PropertyForm from "./PropertyForm";
import AdminPropertyCard from "./AdminPropertyCard";
import Adminpropertyagent from "./Adminpropertyagent";
import AgentsPage from "./AgentsPage"; // Import the AgentsPage component

// Inline LoadingSpinner component
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("properties");
  const [editingProperty, setEditingProperty] = useState(null);
  const [analyticsView, setAnalyticsView] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Safe check for auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    if (!authLoading && isAuthenticated && !user?.isAdmin) {
      console.log('🚫 Not admin, redirecting to home');
      window.location.href = '/';
      return;
    }
  }, [authLoading, isAuthenticated, user]);

  const getProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchPendingProperties();
      setProperties(data.properties);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "dashboard") {
      getProperties();
    }
  }, [activeSection]);

  const handleEditProperty = (propertyId) => {
    setEditingProperty(propertyId);
  };

  const handlePropertyUpdated = () => {
    setEditingProperty(null);
    if (activeSection === "dashboard") {
      getProperties();
    }
  };

  const handleCreateProperty = async (propertyData) => {
    try {
      // This will be handled by the PropertyForm component
      console.log('Creating property:', propertyData);
      // After successful creation, navigate back to properties
      setActiveSection("properties");
    } catch (err) {
      setError(err.message || 'Failed to create property');
    }
  };

  const handleRetry = () => {
    if (activeSection === "dashboard") {
      getProperties();
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return <LoadingSpinner message="Checking admin permissions..." />;
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  // Render error state
  const renderErrorState = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    if (error && activeSection === "dashboard") {
      return renderErrorState();
    }

    switch (activeSection) {
      case "properties":
        return <AdminProperties onEditProperty={handleEditProperty} />;
      case "property-agent":
        return <Adminpropertyagent />;
      case "agents":
        return <AgentsPage />; // Add Agents section
      case "users":
        return <AdminUsers />;
      case "analytics":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {analyticsView === "overview" ? "Click Analytics Overview" : "Detailed Click Analytics"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {analyticsView === "overview" 
                    ? "High-level overview of user interactions" 
                    : "Complete tracking and analysis of all user interactions"
                  }
                </p>
              </div>
              <div className="flex justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => setAnalyticsView("overview")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                    analyticsView === "overview"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setAnalyticsView("details")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                    analyticsView === "details"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>Detailed View</span>
                </button>
              </div>
            </div>
            
            {analyticsView === "overview" ? <AdminClickAnalytics /> : <ClickAnalyticsDetails />}
          </div>
        );
      case "enquiries":
        return <AdminEnquiries />;
      case "property-form":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Add New Property with Agent
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Create new property listings with agent contact information
                </p>
              </div>
              <button
                onClick={() => setActiveSection("properties")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Properties</span>
              </button>
            </div>
            
            {/* Use PropertyForm component here */}
            <PropertyForm 
              onSubmit={handleCreateProperty}
              onClose={() => setActiveSection("properties")}
            />
          </div>
        );
      case "edit":
        return <PropertyForm />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-700">Select a section to get started</h2>
          </div>
        );
    }
  };

  if (loading && activeSection === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="text-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your real estate platform</p>
              {user && (
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Welcome, {user.name} ({user.username})
                </p>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveSection("properties");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "properties"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("property-agent");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "property-agent"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Property & Agent</span>
            </button>

            {/* NEW AGENTS BUTTON */}
            <button
              onClick={() => {
                setActiveSection("agents");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "agents"
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Agents</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("property-form");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "property-form"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Property</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("users");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "users"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Users</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("analytics");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "analytics"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Click Analytics</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("enquiries");
                setError(null);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                activeSection === "enquiries"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Enquiries</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setActiveSection("properties");
                  setAnalyticsView("overview");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "properties"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Properties</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("property-agent");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "property-agent"
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Property & Agent</span>
              </button>

              {/* NEW AGENTS BUTTON FOR MOBILE */}
              <button
                onClick={() => {
                  setActiveSection("agents");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "agents"
                    ? "bg-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Agents</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("property-form");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "property-form"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Property</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("users");
                  setAnalyticsView("overview");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "users"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Users</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("analytics");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "analytics"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Click Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("enquiries");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "enquiries"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Enquiries</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Section Content */}
        <div className="bg-white rounded-lg shadow-md min-h-[400px] sm:min-h-[600px] overflow-hidden">
          {renderActiveSection()}
        </div>

        {/* Property Edit Modal */}
        {editingProperty && (
          <PropertyEdit
            propertyId={editingProperty}
            onClose={() => setEditingProperty(null)}
            onUpdate={handlePropertyUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;