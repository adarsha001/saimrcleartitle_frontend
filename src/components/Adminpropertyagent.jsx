// components/Adminpropertyagent.jsx
import React, { useState, useEffect } from 'react';
import { 
  getPropertiesWithAgents, 
  deletePropertyByAdmin,
  toggleFeatured,
  approveProperty,
  rejectProperty,
  getPropertyStats,
  createPropertyByAdmin,
  updatePropertyByAdmin,
  getPropertyById,
  assignAgentToProperty,
  getAgentsList
} from '../api/adminApi';
import AdminPropertyCard from './AdminPropertyCard';
import PropertyForm from './PropertyForm';
import LoadingSpinner from './LoadingSpinner';
import AgentAssignmentModal from './AgentAssignmentModal';

const Adminpropertyagent = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    approvalStatus: '',
    hasAgent: '',
    search: '',
    city: '',
    forSale: '',
    isFeatured: '',
    isVerified: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, [filters, pagination.page, sortBy, sortOrder]);

 const fetchProperties = async () => {
  try {
    setLoading(true);
    
    // Test without any filters first
    const testParams = {
      page: pagination.page,
      limit: pagination.limit,
      // Remove all filters for testing
    };
    
    console.log('🔄 Fetching with params:', testParams);
    
    const response = await getPropertiesWithAgents(testParams);
    console.log("📨 Response data:", response.data);
    
    setProperties(response.data.data);
    setPagination(prev => ({
      ...prev,
      total: response.data.pagination.totalProperties,
      totalPages: response.data.pagination.totalPages
    }));
  } catch (err) {
    console.error('❌ Fetch error:', err);
    setError(err.message || 'Failed to fetch properties');
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
    try {
      const response = await getPropertyStats();
      setStats(response.data.data);
          console.log("response",response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    
    try {
      await deletePropertyByAdmin(propertyId);
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      fetchStats();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleToggleFeatured = async (propertyId) => {
    try {
      await toggleFeatured(propertyId);
      setProperties(prev => prev.map(p => 
        p._id === propertyId ? { ...p, isFeatured: !p.isFeatured } : p
      ));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update featured status');
    }
  };

  const handleStatusChange = async (propertyId, status, reason = '') => {
    try {
      if (status === 'approved') {
        await approveProperty(propertyId);
      } else {
        await rejectProperty(propertyId, reason || 'Rejected by admin');
      }
      setProperties(prev => prev.map(p => 
        p._id === propertyId ? { ...p, approvalStatus: status } : p
      ));
      fetchStats();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update property status');
    }
  };

  const handleEditProperty = async (propertyId) => {
    try {
      setLoading(true);
      const response = await getPropertyById(propertyId);
      setEditingProperty(response.data.data);
      setShowPropertyForm(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load property for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = (property) => {
    setSelectedProperty(property);
    setShowAgentModal(true);
  };

  const handleAgentAssignment = async (agentData) => {
    try {
      await assignAgentToProperty(selectedProperty._id, agentData);
      fetchProperties();
      setShowAgentModal(false);
      setSelectedProperty(null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to assign agent');
    }
  };

  const handlePropertyFormSubmit = async (formData, isEdit = false) => {
    try {
      if (isEdit && editingProperty) {
        await updatePropertyByAdmin(editingProperty._id, formData);
      } else {
        await createPropertyByAdmin(formData);
      }
      
      setShowPropertyForm(false);
      setEditingProperty(null);
      fetchProperties();
      fetchStats();
      setError(null);
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} property`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      approvalStatus: '',
      hasAgent: '',
      search: '',
      city: '',
      forSale: '',
      isFeatured: '',
      isVerified: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading && properties.length === 0) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Property & Agent Management
              </h1>
              <p className="mt-2 text-sm lg:text-base text-gray-600">
                Manage all properties, agent assignments, and approvals
              </p>
            </div>
            <button
              onClick={() => setShowPropertyForm(true)}
              className="mt-4 lg:mt-0 bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm lg:text-base">Add New Property</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm lg:text-base font-medium text-gray-600">Total Properties</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.overall.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm lg:text-base font-medium text-gray-600">Approved</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.overall.totalApproved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm lg:text-base font-medium text-gray-600">Pending</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.overall.totalPending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm lg:text-base font-medium text-gray-600">With Agents</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.overall.totalWithAgents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search properties..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Commercial">Commercial</option>
                <option value="Outright">Outright</option>
                <option value="Farmland">Farmland</option>
                <option value="JD/JV">JD/JV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.approvalStatus}
                onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
              <select
                value={filters.hasAgent}
                onChange={(e) => handleFilterChange('hasAgent', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Properties</option>
                <option value="true">With Agents</option>
                <option value="false">Without Agents</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="displayOrder">Display Order</option>
                <option value="agentName">Agent Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {/* {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )} */}

        {/* Properties Grid */}
        {loading ? (
          <LoadingSpinner message="Loading properties..." />
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or add a new property.</p>
            <button
              onClick={() => setShowPropertyForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Property
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map(property => (
              <AdminPropertyCard
                key={property._id}
                property={property}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                onToggleFeatured={handleToggleFeatured}
                onStatusChange={handleStatusChange}
                onAssignAgent={handleAssignAgent}
                showApproveReject={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handlePropertyFormSubmit}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
        />
      )}

      {/* Agent Assignment Modal */}
      {showAgentModal && (
        <AgentAssignmentModal
          property={selectedProperty}
          onSubmit={handleAgentAssignment}
          onClose={() => {
            setShowAgentModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
};

export default Adminpropertyagent;