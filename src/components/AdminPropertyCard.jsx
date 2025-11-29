// components/AdminPropertyCard.jsx
import React, { useState } from 'react';

const AdminPropertyCard = ({ 
  property, 
  onEdit, 
  onDelete, 
  onToggleFeatured, 
  onStatusChange, 
  onAssignAgent,
  showApproveReject = true 
}) => {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Commercial': return 'bg-blue-100 text-blue-800';
      case 'Outright': return 'bg-purple-100 text-purple-800';
      case 'Farmland': return 'bg-green-100 text-green-800';
      case 'JD/JV': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onStatusChange(property._id, 'rejected', rejectReason);
      setShowRejectReason(false);
      setRejectReason('');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderAttributes = () => {
    const { attributes } = property;
    if (!attributes) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        {attributes.square && (
          <div>
            <span className="font-medium text-gray-700">Area:</span>
            <span className="ml-2 text-gray-600">{attributes.square}</span>
          </div>
        )}
        {attributes.facing && (
          <div>
            <span className="font-medium text-gray-700">Facing:</span>
            <span className="ml-2 text-gray-600">{attributes.facing}</span>
          </div>
        )}
        {attributes.roadWidth && (
          <div>
            <span className="font-medium text-gray-700">Road Width:</span>
            <span className="ml-2 text-gray-600">{attributes.roadWidth} ft</span>
          </div>
        )}
        {attributes.waterSource && (
          <div>
            <span className="font-medium text-gray-700">Water Source:</span>
            <span className="ml-2 text-gray-600">{attributes.waterSource}</span>
          </div>
        )}
        {attributes.expectedROI && (
          <div>
            <span className="font-medium text-gray-700">Expected ROI:</span>
            <span className="ml-2 text-gray-600">{attributes.expectedROI}%</span>
          </div>
        )}
        {attributes.legalClearance && (
          <div>
            <span className="font-medium text-gray-700">Legal Clearance:</span>
            <span className="ml-2 text-green-600">✓ Approved</span>
          </div>
        )}
      </div>
    );
  };

  const renderFeatures = () => {
    if (!property.features || property.features.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {property.features.map((feature, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {feature}
          </span>
        ))}
      </div>
    );
  };

  const renderNearby = () => {
    if (!property.nearby) return null;

    const nearbyPlaces = Object.entries(property.nearby)
      .filter(([_, distance]) => distance !== null && distance !== '')
      .map(([place, distance]) => ({ place, distance }));

    if (nearbyPlaces.length === 0) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        {nearbyPlaces.map(({ place, distance }) => (
          <div key={place}>
            <span className="font-medium text-gray-700">{place}:</span>
            <span className="ml-2 text-gray-600">{distance} km</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Property Image and Basic Info */}
          <div className="flex flex-col lg:flex-row lg:space-x-4 flex-1">
            <div className="w-full lg:w-48 h-48 mb-4 lg:mb-0 flex-shrink-0">
              <img
                src={property.images?.[0]?.url || '/api/placeholder/300/200'}
                alt={property.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="flex justify-center mt-2">
                <span className="text-xs text-gray-500">
                  {property.images?.length || 0} image{property.images?.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.approvalStatus)}`}>
                  {property.approvalStatus?.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(property.category)}`}>
                  {property.category}
                </span>
                {property.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⭐ FEATURED
                  </span>
                )}
                {property.isVerified && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✓ VERIFIED
                  </span>
                )}
                {property.forSale && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    FOR SALE
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {property.title}
              </h3>
              
              <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                {property.description}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {property.price}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">
                    {property.city}
                    {property.propertyLocation && (
                      <span className="block text-xs text-gray-600 truncate">
                        {property.propertyLocation}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Display Order</p>
                  <p className="font-semibold text-gray-900">{property.displayOrder || 0}</p>
                </div>
              </div>

              {/* Property Details Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showPropertyDetails ? 'Hide' : 'Show'} Property Details
                  <svg 
                    className={`w-4 h-4 transition-transform ${showPropertyDetails ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showPropertyDetails && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                    {renderAttributes()}
                    
                    {property.features && property.features.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Features:</h5>
                        {renderFeatures()}
                      </div>
                    )}
                    
                    {renderNearby()}
                  </div>
                )}
              </div>

              {/* Agent Information */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Agent Information</p>
                  <button
                    onClick={() => setShowAgentDetails(!showAgentDetails)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {showAgentDetails ? 'Hide' : 'Show'} Details
                    <svg 
                      className={`w-3 h-3 transition-transform ${showAgentDetails ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {property.agentDetails?.name ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {property.agentDetails.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{property.agentDetails.name}</p>
                          {property.agentDetails.company && (
                            <p className="text-sm text-gray-600">{property.agentDetails.company}</p>
                          )}
                        </div>
                      </div>
                      {property.agentDetails.agentId ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Registered
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          Manual Entry
                        </span>
                      )}
                    </div>

                    {/* Expanded Agent Details */}
                    {showAgentDetails && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                        {property.agentDetails.phoneNumber && (
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{property.agentDetails.phoneNumber}</span>
                          </div>
                        )}
                        {property.agentDetails.alternativePhoneNumber && (
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{property.agentDetails.alternativePhoneNumber}</span>
                          </div>
                        )}
                        {property.agentDetails.email && (
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">{property.agentDetails.email}</span>
                          </div>
                        )}
                        {property.agentDetails.officeAddress && (
                          <div className="flex items-start text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <span className="text-gray-700 block">
                                {property.agentDetails.officeAddress.street}
                              </span>
                              {property.agentDetails.officeAddress.city && (
                                <span className="text-gray-600 text-xs">
                                  {property.agentDetails.officeAddress.city}, {property.agentDetails.officeAddress.state} - {property.agentDetails.officeAddress.pincode}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {property.agentDetails.languages && property.agentDetails.languages.length > 0 && (
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span className="text-gray-700">
                              {property.agentDetails.languages.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700 text-sm font-medium">No agent assigned</p>
                    <p className="text-yellow-600 text-xs mt-1">Click "Assign Agent" to add an agent</p>
                  </div>
                )}
              </div>

              {/* Property Metadata */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span>Created: {formatDate(property.createdAt)}</span>
                {property.updatedAt && property.updatedAt !== property.createdAt && (
                  <span>Updated: {formatDate(property.updatedAt)}</span>
                )}
                {property.createdBy?.name && (
                  <span>By: {property.createdBy.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(property._id)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(property._id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onToggleFeatured(property._id)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-1 ${
                  property.isFeatured 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>{property.isFeatured ? 'Unfeature' : 'Feature'}</span>
              </button>
              
              <button
                onClick={() => onAssignAgent(property)}
                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Assign Agent</span>
              </button>
            </div>

            {/* Approve/Reject Buttons */}
            {showApproveReject && property.approvalStatus === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onStatusChange(property._id, 'approved')}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve</span>
                </button>
                
                {!showRejectReason ? (
                  <button
                    onClick={() => setShowRejectReason(true)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject</span>
                  </button>
                ) : (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason..."
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm mb-1"
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={handleReject}
                        className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowRejectReason(false)}
                        className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t">
              <button 
                onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{showPropertyDetails ? 'Hide' : 'Show'} Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rejection Reason Display */}
        {property.approvalStatus === 'rejected' && property.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                <p className="text-sm text-red-700 mt-1">{property.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyCard;