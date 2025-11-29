import React, { useState, useEffect } from 'react';
import { createPropertyByAdmin } from '../api/adminApi';

const PropertyForm = ({ property, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    images: [],
    city: '',
    propertyLocation: '',
    coordinates: { latitude: '', longitude: '' },
    price: '',
    mapUrl: '',
    category: 'Commercial',
    approvalStatus: 'approved',
    displayOrder: 0,
    forSale: true,
    isFeatured: false,
    isVerified: false,
    rejectionReason: '',
    agentDetails: {
      agentId: '',
      name: '',
      phoneNumber: '',
      alternativePhoneNumber: '',
      email: '',
      company: '',
      languages: [],
      officeAddress: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    attributes: {
      square: '',
      propertyLabel: '',
      leaseDuration: '',
      typeOfJV: '',
      expectedROI: '',
      irrigationAvailable: false,
      facing: '',
      roadWidth: '',
      waterSource: '',
      soilType: '',
      legalClearance: false
    },
    distanceKey: [],
    features: [],
    nearby: {
      Highway: '',
      Airport: '',
      BusStop: '',
      Metro: '',
      CityCenter: '',
      IndustrialArea: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState('');

  // Language options
  const commonLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi'];

  useEffect(() => {
    if (property) {
      const agentDetails = property.agentDetails || {};
      const languages = agentDetails.languages || [];
      
      setFormData({
        title: property.title || '',
        description: property.description || '',
        content: property.content || '',
        images: property.images || [],
        city: property.city || '',
        propertyLocation: property.propertyLocation || '',
        coordinates: property.coordinates || { latitude: '', longitude: '' },
        price: property.price || '',
        mapUrl: property.mapUrl || '',
        category: property.category || 'Commercial',
        approvalStatus: property.approvalStatus || 'approved',
        displayOrder: property.displayOrder || 0,
        forSale: property.forSale !== undefined ? property.forSale : true,
        isFeatured: property.isFeatured || false,
        isVerified: property.isVerified || false,
        rejectionReason: property.rejectionReason || '',
        agentDetails: {
          agentId: agentDetails.agentId || '',
          name: agentDetails.name || '',
          phoneNumber: agentDetails.phoneNumber || '',
          alternativePhoneNumber: agentDetails.alternativePhoneNumber || '',
          email: agentDetails.email || '',
          company: agentDetails.company || '',
          languages: languages,
          officeAddress: agentDetails.officeAddress || {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        },
        attributes: property.attributes || {
          square: '',
          propertyLabel: '',
          leaseDuration: '',
          typeOfJV: '',
          expectedROI: '',
          irrigationAvailable: false,
          facing: '',
          roadWidth: '',
          waterSource: '',
          soilType: '',
          legalClearance: false
        },
        distanceKey: property.distanceKey || [],
        features: property.features || [],
        nearby: property.nearby || {
          Highway: '',
          Airport: '',
          BusStop: '',
          Metro: '',
          CityCenter: '',
          IndustrialArea: ''
        }
      });

      setSelectedLanguages(languages);

      // Set image previews for existing property
      if (property.images && property.images.length > 0) {
        const existingPreviews = property.images.map((img, index) => ({
          preview: img.url,
          name: `Image ${index + 1}`,
          isExisting: true
        }));
        setImagePreviews(existingPreviews);
      }
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('agent.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        agentDetails: {
          ...prev.agentDetails,
          [field]: value
        }
      }));
    } else if (name.startsWith('agent.officeAddress.')) {
      const field = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        agentDetails: {
          ...prev.agentDetails,
          officeAddress: {
            ...prev.agentDetails.officeAddress,
            [field]: value
          }
        }
      }));
    } else if (name.startsWith('attributes.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('nearby.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nearby: {
          ...prev.nearby,
          [field]: value
        }
      }));
    } else if (name.startsWith('coordinates.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  // Handle language selection
  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev => {
      const newLanguages = prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language];
      
      // Update form data
      setFormData(prevData => ({
        ...prevData,
        agentDetails: {
          ...prevData.agentDetails,
          languages: newLanguages
        }
      }));
      
      return newLanguages;
    });
  };

  // Add custom language
  const handleAddCustomLanguage = () => {
    if (languageInput.trim() && !selectedLanguages.includes(languageInput.trim())) {
      const newLanguage = languageInput.trim();
      const newLanguages = [...selectedLanguages, newLanguage];
      
      setSelectedLanguages(newLanguages);
      setFormData(prevData => ({
        ...prevData,
        agentDetails: {
          ...prevData.agentDetails,
          languages: newLanguages
        }
      }));
      setLanguageInput('');
    }
  };

  // Remove language
  const handleRemoveLanguage = (language) => {
    const newLanguages = selectedLanguages.filter(l => l !== language);
    setSelectedLanguages(newLanguages);
    setFormData(prevData => ({
      ...prevData,
      agentDetails: {
        ...prevData.agentDetails,
        languages: newLanguages
      }
    }));
  };

  // Handle image file selection
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        alert(`Invalid file type: ${file.name}. Please upload JPEG, JPG, PNG, or WebP images.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);

    try {
      // Create preview URLs
      const newPreviews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        isExisting: false
      }));

      setImagePreviews(prev => [...prev, ...newPreviews]);

    } catch (error) {
      console.error('Error processing images:', error);
      setError('Error processing images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image from preview
  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      // Revoke the object URL to avoid memory leaks (only for new images)
      if (!newPreviews[index].isExisting) {
        URL.revokeObjectURL(newPreviews[index].preview);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Reorder images
  const moveImage = (fromIndex, toIndex) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const [movedItem] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedItem);
      return newPreviews;
    });
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);
  
  try {
    // Validate required fields
    if (!formData.title || !formData.city || !formData.propertyLocation || !formData.price || !formData.category) {
      throw new Error('Please fill in all required fields');
    }

    // Validate images
    if (imagePreviews.length === 0) {
      throw new Error('Please upload at least one image');
    }

    // ✅ FIX: Create FormData object for file upload
    const submitFormData = new FormData();

    // ✅ Add all basic fields as strings
    submitFormData.append('title', formData.title.trim());
    submitFormData.append('description', formData.description.trim() || '');
    submitFormData.append('content', formData.content.trim() || '');
    submitFormData.append('city', formData.city.trim());
    submitFormData.append('propertyLocation', formData.propertyLocation.trim());
    submitFormData.append('price', formData.price);
    submitFormData.append('mapUrl', formData.mapUrl.trim() || '');
    submitFormData.append('category', formData.category);
    submitFormData.append('approvalStatus', 'approved');
    submitFormData.append('displayOrder', formData.displayOrder.toString());
    submitFormData.append('forSale', formData.forSale.toString());
    submitFormData.append('isFeatured', formData.isFeatured.toString());
    submitFormData.append('isVerified', formData.isVerified.toString());
    submitFormData.append('rejectionReason', '');

    // ✅ Add nested objects as JSON strings (your server expects this)
    submitFormData.append('coordinates', JSON.stringify({
      latitude: formData.coordinates.latitude ? parseFloat(formData.coordinates.latitude) : null,
      longitude: formData.coordinates.longitude ? parseFloat(formData.coordinates.longitude) : null
    }));

    submitFormData.append('agentDetails', JSON.stringify({
      agentId: formData.agentDetails.agentId || null,
      name: formData.agentDetails.name?.trim() || '',
      phoneNumber: formData.agentDetails.phoneNumber?.trim() || '',
      alternativePhoneNumber: formData.agentDetails.alternativePhoneNumber?.trim() || '',
      email: formData.agentDetails.email?.trim() || '',
      company: formData.agentDetails.company?.trim() || '',
      languages: selectedLanguages,
      officeAddress: {
        street: formData.agentDetails.officeAddress?.street?.trim() || '',
        city: formData.agentDetails.officeAddress?.city?.trim() || '',
        state: formData.agentDetails.officeAddress?.state?.trim() || '',
        pincode: formData.agentDetails.officeAddress?.pincode?.trim() || ''
      }
    }));

    submitFormData.append('attributes', JSON.stringify({
      square: formData.attributes.square?.trim() || '',
      propertyLabel: formData.attributes.propertyLabel?.trim() || '',
      leaseDuration: formData.attributes.leaseDuration?.trim() || '',
      typeOfJV: formData.attributes.typeOfJV?.trim() || '',
      expectedROI: formData.attributes.expectedROI ? parseFloat(formData.attributes.expectedROI) : null,
      irrigationAvailable: formData.attributes.irrigationAvailable,
      facing: formData.attributes.facing?.trim() || '',
      roadWidth: formData.attributes.roadWidth ? parseFloat(formData.attributes.roadWidth) : null,
      waterSource: formData.attributes.waterSource?.trim() || '',
      soilType: formData.attributes.soilType?.trim() || '',
      legalClearance: formData.attributes.legalClearance
    }));

    submitFormData.append('distanceKey', JSON.stringify(formData.distanceKey || []));
    submitFormData.append('features', JSON.stringify(formData.features || []));

    submitFormData.append('nearby', JSON.stringify({
      Highway: formData.nearby.Highway ? parseFloat(formData.nearby.Highway) : null,
      Airport: formData.nearby.Airport ? parseFloat(formData.nearby.Airport) : null,
      BusStop: formData.nearby.BusStop ? parseFloat(formData.nearby.BusStop) : null,
      Metro: formData.nearby.Metro ? parseFloat(formData.nearby.Metro) : null,
      CityCenter: formData.nearby.CityCenter ? parseFloat(formData.nearby.CityCenter) : null,
      IndustrialArea: formData.nearby.IndustrialArea ? parseFloat(formData.nearby.IndustrialArea) : null
    }));

    // ✅ CRITICAL: Add image files to FormData
    const newImageFiles = imagePreviews
      .filter(preview => !preview.isExisting && preview.file)
      .map(preview => preview.file);

    console.log(`📸 Adding ${newImageFiles.length} images to FormData`);
    
    if (newImageFiles.length === 0) {
      throw new Error('No valid image files found. Please upload at least one image.');
    }

    // Append each image file with field name 'images'
    newImageFiles.forEach((file, index) => {
      console.log(`  Image ${index + 1}:`, file.name, `(${file.size} bytes, ${file.type})`);
      submitFormData.append('images', file); // Field name must be 'images'
    });

    // ✅ DEBUG: Verify FormData before sending
    console.log('🔍 Final FormData verification:');
    let imageCount = 0;
    for (let [key, value] of submitFormData.entries()) {
      if (key === 'images') {
        imageCount++;
        console.log(`  ${key}[${imageCount}]:`, value.name, `(${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, typeof value === 'string' ? value.substring(0, 100) + '...' : value);
      }
    }
    
    console.log(`📊 Total images in FormData: ${imageCount}`);

    if (imageCount === 0) {
      throw new Error('No images were added to FormData. Please check image upload.');
    }

    console.log('🚀 Sending property creation request with FormData...');
    const response = await createPropertyByAdmin(submitFormData);
    
    console.log('✅ Property created successfully:', response);
    
    setSuccess(true);
    
    // Call the onSubmit callback if provided
    if (onSubmit) {
      await onSubmit(response.data || response);
    }
    
    // Close the form after a short delay to show success message
    setTimeout(() => {
      if (onClose) onClose();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Property creation error:', error);
    setError(error.message || 'Failed to create property. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const featureOptions = {
    Commercial: [
      "Conference Room", "CCTV Surveillance", "Power Backup", "Fire Safety",
      "Cafeteria", "Reception Area", "Parking", "Lift(s)"
    ],
    Farmland: [
      "Borewell", "Fencing", "Electricity Connection", "Water Source",
      "Drip Irrigation", "Storage Shed"
    ],
    Outright: [
      "Highway Access", "Legal Assistance", "Joint Development Approved",
      "Investor Friendly", "Gated Boundary"
    ],
    "JD/JV": [
      "Highway Access", "Legal Assistance", "Joint Development Approved",
      "Investor Friendly", "Gated Boundary"
    ]
  };

  const currentFeatures = featureOptions[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Property created successfully! Redirecting...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Enter property title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="Commercial">Commercial</option>
                <option value="Outright">Outright</option>
                <option value="Farmland">Farmland</option>
                <option value="JD/JV">JD/JV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., 5000000 or 'Contact for Price'"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Location *
            </label>
            <input
              type="text"
              name="propertyLocation"
              value={formData.propertyLocation}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter full property address"
            />
          </div>

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images *</h3>
            
            {/* Image Upload Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 10 images, 5MB each)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={loading || uploadingImages}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: JPEG, JPG, PNG, WebP
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Previews ({imagePreviews.length} images selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={loading}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={loading}
                              className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          )}
                          {index < imagePreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              disabled={loading}
                              className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                      {preview.isExisting && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                          Existing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploading Indicator */}
            {uploadingImages && (
              <div className="flex items-center space-x-2 text-blue-600">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Processing images...</span>
              </div>
            )}
          </div>

          {/* Agent Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent ID (Optional)
                </label>
                <input
                  type="text"
                  name="agent.agentId"
                  value={formData.agentDetails.agentId}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="User ID if agent is registered user"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="agent.name"
                  value={formData.agentDetails.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Agent full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="agent.phoneNumber"
                  value={formData.agentDetails.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Primary phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Phone Number
                </label>
                <input
                  type="text"
                  name="agent.alternativePhoneNumber"
                  value={formData.agentDetails.alternativePhoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Alternative phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="agent.email"
                  value={formData.agentDetails.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="agent.company"
                  value={formData.agentDetails.company}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Languages Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="space-y-3">
                {/* Common Languages */}
                <div className="flex flex-wrap gap-2">
                  {commonLanguages.map(language => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLanguageToggle(language)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedLanguages.includes(language)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {language}
                    </button>
                  ))}
                </div>

                {/* Custom Language Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    disabled={loading}
                    placeholder="Add custom language"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    disabled={loading || !languageInput.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Languages Display */}
                {selectedLanguages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selected Languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLanguages.map(language => (
                        <span
                          key={language}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(language)}
                            disabled={loading}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Office Address */}
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Office Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street
                  </label>
                  <input
                    type="text"
                    name="agent.officeAddress.street"
                    value={formData.agentDetails.officeAddress.street}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="agent.officeAddress.city"
                    value={formData.agentDetails.officeAddress.city}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="agent.officeAddress.state"
                    value={formData.agentDetails.officeAddress.state}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="agent.officeAddress.pincode"
                    value={formData.agentDetails.officeAddress.pincode}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Attributes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Area
                </label>
                <input
                  type="text"
                  name="attributes.square"
                  value={formData.attributes.square}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="e.g., 2000 sq ft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Label
                </label>
                <input
                  type="text"
                  name="attributes.propertyLabel"
                  value={formData.attributes.propertyLabel}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="e.g., Premium Commercial Space"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <input
                  type="text"
                  name="attributes.facing"
                  value={formData.attributes.facing}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="e.g., East, West, North, South"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Road Width (ft)
                </label>
                <input
                  type="number"
                  name="attributes.roadWidth"
                  value={formData.attributes.roadWidth}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Road width in feet"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    disabled={loading}
                    className="rounded border-gray-300 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {(loading || uploadingImages) && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {uploadingImages ? 'Uploading Images...' : 
                 loading ? 'Creating...' : 
                 (property ? 'Update Property' : 'Create Property')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;