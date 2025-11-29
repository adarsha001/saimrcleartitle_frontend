// components/AgentAssignmentModal.jsx
import React, { useState, useEffect } from 'react';
import { getAgentsList } from '../api/adminApi';

const AgentAssignmentModal = ({ property, onSubmit, onClose }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [manualAgentDetails, setManualAgentDetails] = useState({
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
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchAgents();
    
    // Pre-fill data if property already has agent details
    if (property?.agentDetails) {
      if (property.agentDetails.agentId) {
        setSelectedAgentId(property.agentDetails.agentId._id || property.agentDetails.agentId);
      } else {
        // If it's a manual entry without a user, we'll treat it as new manual entry
        setManualAgentDetails({
          name: property.agentDetails.name || '',
          phoneNumber: property.agentDetails.phoneNumber || '',
          alternativePhoneNumber: property.agentDetails.alternativePhoneNumber || '',
          email: property.agentDetails.email || '',
          company: property.agentDetails.company || '',
          languages: property.agentDetails.languages || [],
          officeAddress: property.agentDetails.officeAddress || {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        });
      }
    }
  }, [property]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAgentsList();
      setAgents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAgentChange = (field, value) => {
    setManualAgentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOfficeAddressChange = (field, value) => {
    setManualAgentDetails(prev => ({
      ...prev,
      officeAddress: {
        ...prev.officeAddress,
        [field]: value
      }
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !manualAgentDetails.languages.includes(newLanguage.trim())) {
      setManualAgentDetails(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setManualAgentDetails(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAgentId && (!manualAgentDetails.name || !manualAgentDetails.phoneNumber)) {
      alert('Please select an existing agent or enter agent details (name and phone number are required)');
      return;
    }

    try {
      setLoading(true);
      
      const agentData = selectedAgentId 
        ? { agentId: selectedAgentId }
        : { agentDetails: manualAgentDetails };

      const result = await onSubmit(agentData);
      
      // Show success message with generated password if it's a new agent
      if (result?.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        setShowSuccess(true);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 5000);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Agent Created Successfully!</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  A new agent account has been created and assigned to this property.
                </p>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Important:</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The agent can login with their phone number and this password:
                  </p>
                  <p className="text-lg font-bold text-center text-gray-900 mt-2 bg-white p-2 rounded border">
                    {generatedPassword}
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Please share this password securely with the agent.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {property?.agentDetails ? 'Update Agent' : 'Assign Agent to Property'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Existing Agents Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => {
                  setSelectedAgentId(e.target.value);
                  // Clear manual details when selecting existing agent
                  if (e.target.value) {
                    setManualAgentDetails({
                      name: '',
                      phoneNumber: '',
                      alternativePhoneNumber: '',
                      email: '',
                      company: '',
                      languages: [],
                      officeAddress: { street: '', city: '', state: '', pincode: '' }
                    });
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an existing agent</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} {agent.lastName || ''} - {agent.company || 'No company'} - {agent.phoneNumber || 'No phone'}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading agents...
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Create New Agent */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Agent
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter agent details to create a new agent account and assign them to this property.
              </p>

              <div className="space-y-6">
                {/* Basic Agent Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={manualAgentDetails.name}
                      onChange={(e) => {
                        handleManualAgentChange('name', e.target.value);
                        // Clear selected agent when typing manual details
                        setSelectedAgentId('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter agent full name"
                      required={!selectedAgentId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={manualAgentDetails.company}
                      onChange={(e) => {
                        handleManualAgentChange('company', e.target.value);
                        setSelectedAgentId('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={manualAgentDetails.phoneNumber}
                      onChange={(e) => {
                        handleManualAgentChange('phoneNumber', e.target.value);
                        setSelectedAgentId('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Primary phone number"
                      required={!selectedAgentId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternative Phone
                    </label>
                    <input
                      type="tel"
                      value={manualAgentDetails.alternativePhoneNumber}
                      onChange={(e) => {
                        handleManualAgentChange('alternativePhoneNumber', e.target.value);
                        setSelectedAgentId('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alternative phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={manualAgentDetails.email}
                      onChange={(e) => {
                        handleManualAgentChange('email', e.target.value);
                        setSelectedAgentId('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="agent@company.com"
                    />
                  </div>
                </div>

                {/* Languages Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages Spoken
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {[
                      "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil",
                      "Urdu", "Gujarati", "Kannada", "Odia", "Malayalam", "Punjabi",
                      "Assamese", "Maithili", "Sanskrit", "Kashmiri", "Sindhi", "Konkani",
                      "Dogri", "Manipuri", "Bodo", "Santali", "Nepali"
                    ].map((language) => (
                      <label key={language} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manualAgentDetails.languages.includes(language)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleManualAgentChange('languages', [...manualAgentDetails.languages, language]);
                            } else {
                              handleManualAgentChange('languages', manualAgentDetails.languages.filter(lang => lang !== language));
                            }
                            setSelectedAgentId('');
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Office Address */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Office Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={manualAgentDetails.officeAddress.street}
                        onChange={(e) => {
                          handleOfficeAddressChange('street', e.target.value);
                          setSelectedAgentId('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street address, building, floor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={manualAgentDetails.officeAddress.city}
                        onChange={(e) => {
                          handleOfficeAddressChange('city', e.target.value);
                          setSelectedAgentId('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={manualAgentDetails.officeAddress.state}
                        onChange={(e) => {
                          handleOfficeAddressChange('state', e.target.value);
                          setSelectedAgentId('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={manualAgentDetails.officeAddress.pincode}
                        onChange={(e) => {
                          handleOfficeAddressChange('pincode', e.target.value);
                          setSelectedAgentId('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : (property?.agentDetails ? 'Update Agent' : 'Assign Agent')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentAssignmentModal;