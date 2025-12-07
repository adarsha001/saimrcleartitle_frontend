import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { 
  Edit, 
  Save, 
  X, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  Globe,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Heart,
  Home,
  MessageSquare,
  Star,
  Trash2,
  Eye,
  Calendar,
  PhoneCall,
  Briefcase,
  Globe as GlobeIcon,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Cake,
  Map,
  Bell,
  Info,
  Target,
  Award,
  FileText,
  Lock,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userEnquiries, setUserEnquiries] = useState([]);
  const [likedProperties, setLikedProperties] = useState([]);
  const [postedProperties, setPostedProperties] = useState([]);
  const [postedStats, setPostedStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    active: 0,
    sold: 0,
    rented: 0,
    expired: 0,
    draft: 0
  });
  const [loading, setLoading] = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [postedLoading, setPostedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    alternativePhoneNumber: '',
    gmail: '',
    userType: '',
    company: '',
    languages: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    preferredLocation: '',
    about: '',
    interests: '',
    website: '',
    specialization: '',
    contactPreferences: {
      phone: true,
      email: true,
      whatsapp: true,
      sms: false
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    officeAddress: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    notifications: {
      emailNotifications: true,
      propertyAlerts: true,
      priceDropAlerts: true,
      newPropertyAlerts: true
    }
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [postedFilters, setPostedFilters] = useState({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Single useEffect to fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await API.get('/users/profile');
        console.log("Full user profile response:", profileResponse.data);
        setUserData(profileResponse.data.user);
        
        // Initialize edit form data
        if (profileResponse.data.user) {
          setEditFormData({
            name: profileResponse.data.user.name || '',
            lastName: profileResponse.data.user.lastName || '',
            phoneNumber: profileResponse.data.user.phoneNumber || '',
            alternativePhoneNumber: profileResponse.data.user.alternativePhoneNumber || '',
            gmail: profileResponse.data.user.gmail || '',
            userType: profileResponse.data.user.userType || 'buyer',
            company: profileResponse.data.user.company || '',
            languages: profileResponse.data.user.languages?.join(', ') || '',
            dateOfBirth: profileResponse.data.user.dateOfBirth ? new Date(profileResponse.data.user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: profileResponse.data.user.gender || '',
            occupation: profileResponse.data.user.occupation || '',
            preferredLocation: profileResponse.data.user.preferredLocation || '',
            about: profileResponse.data.user.about || '',
            interests: profileResponse.data.user.interests?.join(', ') || '',
            website: profileResponse.data.user.website || '',
            specialization: profileResponse.data.user.specialization?.join(', ') || '',
            contactPreferences: profileResponse.data.user.contactPreferences || {
              phone: true,
              email: true,
              whatsapp: true,
              sms: false
            },
            socialMedia: profileResponse.data.user.socialMedia || {
              facebook: '',
              twitter: '',
              linkedin: '',
              instagram: ''
            },
            officeAddress: profileResponse.data.user.officeAddress || {
              street: '',
              city: '',
              state: '',
              pincode: ''
            },
            notifications: profileResponse.data.user.notifications || {
              emailNotifications: true,
              propertyAlerts: true,
              priceDropAlerts: true,
              newPropertyAlerts: true
            }
          });
          setAvatarPreview(profileResponse.data.user.avatar);
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Separate useEffect for tab-specific data
  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'enquiries') {
        await fetchUserEnquiries();
      } else if (activeTab === 'favorites') {
        await fetchLikedProperties();
      } else if (activeTab === 'posted') {
        await fetchPostedProperties();
      }
    };
    
    fetchTabData();
  }, [activeTab, postedFilters]);

  // Fetch posted properties
  const fetchPostedProperties = async () => {
    setPostedLoading(true);
    try {
      console.log("Fetching posted properties with filters:", postedFilters);
      const response = await API.get('/users/posted-properties', {
        params: postedFilters
      });
      
      console.log("Posted properties response:", response.data);
      
      if (response.data.success) {
        setPostedProperties(response.data.postedProperties || []);
        setPostedStats(response.data.stats || {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          active: 0,
          sold: 0,
          rented: 0,
          expired: 0,
          draft: 0
        });
      } else {
        console.error("Failed to fetch posted properties:", response.data.message);
        setPostedProperties([]);
      }
    } catch (error) {
      console.error('Error fetching posted properties:', error);
      console.error('Error details:', error.response?.data);
      setPostedProperties([]);
    } finally {
      setPostedLoading(false);
    }
  };

  // Fetch liked properties
  const fetchLikedProperties = async () => {
    try {
      console.log("Fetching liked properties...");
      const response = await API.get('/users/liked-properties');
      console.log("Liked properties response:", response.data);
      
      if (response.data.success) {
        setLikedProperties(response.data.likedProperties || []);
      } else {
        console.error("Failed to fetch liked properties:", response.data.message);
        setLikedProperties([]);
      }
    } catch (error) {
      console.error('Error fetching liked properties:', error);
      setLikedProperties([]);
    }
  };

  // Fetch user enquiries
  const fetchUserEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const response = await API.get('/users/my-enquiries');
      setUserEnquiries(response.data.enquiries || []);
  
    } catch (error) {
      console.error('Error fetching user enquiries:', error);
      setUserEnquiries([]);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Handle filter changes for posted properties
  const handleFilterChange = (filterType, value) => {
    setPostedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle sort changes
  const handleSortChange = (sortBy) => {
    setPostedFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Handle delete property
  const handleDeleteProperty = async (propertyId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/properties/${propertyId}`);
      // Update the posted properties list immediately
      setPostedProperties(prev => prev.filter(property => property._id !== propertyId));
      // Update stats
      setPostedStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
      alert('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  // Handle edit property
  const handleEditProperty = (propertyId, e) => {
    e.stopPropagation();
    navigate(`/edit-property/${propertyId}`);
  };

  // Handle view property
  const handleViewProperty = (propertyId, e) => {
    e.stopPropagation();
    navigate(`/property/${propertyId}`);
  };

  // Handle share property
  const handleShareProperty = (propertyId, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/property/${propertyId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this property',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  // Handle download property details
  const handleDownloadProperty = (property, e) => {
    e.stopPropagation();
    const propertyDetails = `
      Property: ${property.title}
      Price: ₹${property.price?.toLocaleString('en-IN')}
      Location: ${property.city}
      Status: ${property.approvalStatus}
      Listed: ${new Date(property.createdAt).toLocaleDateString()}
      
      ${property.description || ''}
    `;
    
    const blob = new Blob([propertyDetails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${property.title.replace(/\s+/g, '-')}-details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Enhanced PropertyCard for posted properties


  // Original PropertyCard for favorites and posted properties
  const PropertyCard = ({ property, likedAt, showDelete = false, onDelete, showStatus = false, status }) => {
    // Get the first image or use placeholder
    const imageUrl = property.images?.[0]?.url || 
                    property.imageUrls?.[0] || 
                    property.images?.[0] 
    
    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer hover:border-blue-900/20"
        onClick={() => handlePropertyClick(property._id)}
      >
        <div className="relative">
          <img 
            src={imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          {property.isVerified && (
            <div className="absolute top-3 left-3 bg-blue-900 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
          )}
          {property.isFeatured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          {showDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(property._id, e);
              }}
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 line-clamp-1">{property.title}</h3>
            {showStatus && status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                {status}
              </span>
            )}
          </div>
          
          <p className="text-2xl font-bold text-blue-900 mb-2">₹{property.price?.toLocaleString('en-IN') || '0'}</p>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.city || property.propertyLocation?.city || 'Location not specified'}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {property.attributes?.bedrooms && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {property.attributes.bedrooms} Beds
              </span>
            )}
            {property.attributes?.bathrooms && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {property.attributes.bathrooms} Baths
              </span>
            )}
            {property.attributes?.area && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {property.attributes.area} sqft
              </span>
            )}
          </div>
          
          {likedAt && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center text-gray-500 text-sm">
                <Heart className="w-4 h-4 mr-1 fill-red-500 text-red-500" />
                Liked {new Date(likedAt).toLocaleDateString()}
              </div>
              <button
                onClick={(e) => handleUnlike(property._id, e)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle property click
  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // Handle unlike property
  const handleUnlike = async (propertyId, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/users/like/${propertyId}`);
      // Update the liked properties list immediately
      setLikedProperties(prev => prev.filter(item => item.property?._id !== propertyId));
    } catch (error) {
      console.error('Error unliking property:', error);
    }
  };

  // Handle edit click
  const handleEditClick = () => {
    setIsEditing(true);
    setActiveTab('edit');
    setEditError('');
    setEditSuccess('');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveTab('favorites');
    if (userData) {
      setEditFormData({
        name: userData.name || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        alternativePhoneNumber: userData.alternativePhoneNumber || '',
        gmail: userData.gmail || '',
        userType: userData.userType || 'buyer',
        company: userData.company || '',
        languages: userData.languages?.join(', ') || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        occupation: userData.occupation || '',
        preferredLocation: userData.preferredLocation || '',
        about: userData.about || '',
        interests: userData.interests?.join(', ') || '',
        website: userData.website || '',
        specialization: userData.specialization?.join(', ') || '',
        contactPreferences: userData.contactPreferences || {
          phone: true,
          email: true,
          whatsapp: true,
          sms: false
        },
        socialMedia: userData.socialMedia || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        officeAddress: userData.officeAddress || {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
        notifications: userData.notifications || {
          emailNotifications: true,
          propertyAlerts: true,
          priceDropAlerts: true,
          newPropertyAlerts: true
        }
      });
    }
    setAvatarFile(null);
    setAvatarPreview(userData?.avatar || '');
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'contactPreferences' || parent === 'notifications') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else if (parent === 'socialMedia') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parent === 'officeAddress') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    setEditError('');
    setEditSuccess('');
  };

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    // Validate phone number
    if (userData?.isGoogleAuth && editFormData.phoneNumber === '1234567890') {
      setEditError('Please update your phone number from the default value');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = editFormData.phoneNumber.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setEditError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (editFormData.alternativePhoneNumber) {
      const cleanAltPhone = editFormData.alternativePhoneNumber.replace(/\D/g, '');
      if (!phoneRegex.test(cleanAltPhone)) {
        setEditError('Please enter a valid 10-digit Indian phone number for alternative phone');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.gmail)) {
      setEditError('Please enter a valid email address');
      return;
    }

    try {
      const updateData = {
        ...editFormData,
        languages: editFormData.languages.split(',').map(lang => lang.trim()).filter(lang => lang),
        interests: editFormData.interests.split(',').map(interest => interest.trim()).filter(interest => interest),
        specialization: editFormData.specialization.split(',').map(spec => spec.trim()).filter(spec => spec),
        phoneNumber: cleanPhone,
        alternativePhoneNumber: editFormData.alternativePhoneNumber ? editFormData.alternativePhoneNumber.replace(/\D/g, '') : ''
      };

      const response = await API.put('/users/profile', updateData);
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          ...updateData
        }));
        
        updateUser(response.data.user);
        
        setEditSuccess('Profile updated successfully!');
        
        if (avatarFile) {
          await uploadAvatar();
        }
        
        setTimeout(() => {
          setIsEditing(false);
          setActiveTab('favorites');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  // Upload avatar
  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await API.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          avatar: response.data.avatarUrl
        }));
        setAvatarPreview(response.data.avatarUrl);
        setAvatarFile(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle delete enquiry
  const handleDeleteEnquiry = async (enquiryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      await API.delete(`/enquiries/${enquiryId}`);
      setUserEnquiries(prev => prev.filter(enquiry => enquiry._id !== enquiryId));
      alert('Enquiry deleted successfully');
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Error deleting enquiry');
    }
  };

  // EnquiryCard component
  const EnquiryCard = ({ enquiry }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{enquiry.property?.title || 'Property'}</h3>
            <p className="text-gray-600 text-sm">Enquiry ID: {enquiry._id?.slice(-8)}</p>
          </div>
       
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <User className="w-4 h-4 mr-2 text-blue-900" />
              <span className="font-medium">Name:</span>
              <span className="ml-2">{enquiry.name}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Phone className="w-4 h-4 mr-2 text-blue-900" />
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{enquiry.phoneNumber}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-blue-900" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{new Date(enquiry.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(enquiry.status)}`}>
                {enquiry.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{enquiry.message}</p>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    </div>
  );

  // Error state
  if (!userData) return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center text-red-600">Error loading profile</div>
      </div>
    </div>
  );

  // Filter liked properties
  const validLikedProperties = likedProperties.filter(item => item?.property && item.property._id);

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      closed: 'bg-gray-100 text-gray-800 border border-gray-200',
      new: 'bg-purple-100 text-purple-800 border border-purple-200',
      active: 'bg-green-100 text-green-800 border border-green-200',
      sold: 'bg-gray-100 text-gray-800 border border-gray-200',
      rented: 'bg-blue-100 text-blue-800 border border-blue-200',
      expired: 'bg-red-100 text-red-800 border border-red-200',
      draft: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // User type options
  const userTypes = [
    { value: "buyer", label: "Property Buyer" },
    { value: "seller", label: "Property Seller" },
    { value: "builder", label: "Builder" },
    { value: "developer", label: "Developer" },
    { value: "agent", label: "Real Estate Agent" },
    { value: "investor", label: "Investor" },
    { value: "other", label: "Other" }
  ];

  // Gender options
  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ];

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt={userData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=blue&color=fff&size=150`;
                      }}
                    />
                  ) : userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=blue&color=fff&size=150`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {userData.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
       
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.name} {userData.lastName}
                </h1>
                <p className="text-gray-600 mt-1">@{userData.username}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {userData.userType}
                  </span>
                  {userData.isAdmin && (
                    <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-sm font-medium">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Admin
                    </span>
                  )}
                  {userData.isGoogleAuth && (
                    <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Google Account
                    </span>
                  )}
                  {userData.isVerified && (
                    <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-sm font-medium">
                      <Award className="w-3 h-3 inline mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing && activeTab !== 'edit' && (
              <button
                onClick={handleEditClick}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Stats Grid - Expanded with All Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-900" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-3 text-blue-900" />
                  <div>
                    <span className="font-medium">Name:</span>
                    <span className="ml-2">{userData.name} {userData.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-3 text-blue-900" />
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2 truncate">{userData.gmail}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-3 text-blue-900" />
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{userData.phoneNumber}</span>
                    {userData.isGoogleAuth && userData.phoneNumber === '1234567890' && (
                      <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                        Update Required
                      </span>
                    )}
                  </div>
                </div>
                {userData.alternativePhoneNumber && (
                  <div className="flex items-center text-gray-700">
                    <PhoneCall className="w-4 h-4 mr-3 text-blue-900" />
                    <div>
                      <span className="font-medium">Alt Phone:</span>
                      <span className="ml-2">{userData.alternativePhoneNumber}</span>
                    </div>
                  </div>
                )}
                {userData.dateOfBirth && (
                  <div className="flex items-center text-gray-700">
                    <Cake className="w-4 h-4 mr-3 text-blue-900" />
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <span className="ml-2">{new Date(userData.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {userData.gender && (
                  <div className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-3 text-blue-900" />
                    <div>
                      <span className="font-medium">Gender:</span>
                      <span className="ml-2 capitalize">{userData.gender}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-900" />
                Professional Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Building2 className="w-4 h-4 mr-3 text-green-900" />
                  <div>
                    <span className="font-medium">User Type:</span>
                    <span className="ml-2 capitalize">{userData.userType}</span>
                  </div>
                </div>
                {userData.occupation && (
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="w-4 h-4 mr-3 text-green-900" />
                    <div>
                      <span className="font-medium">Occupation:</span>
                      <span className="ml-2">{userData.occupation}</span>
                    </div>
                  </div>
                )}
                {userData.company && (
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-4 h-4 mr-3 text-green-900" />
                    <div>
                      <span className="font-medium">Company:</span>
                      <span className="ml-2">{userData.company}</span>
                    </div>
                  </div>
                )}
                {userData.preferredLocation && (
                  <div className="flex items-center text-gray-700">
                    <Map className="w-4 h-4 mr-3 text-green-900" />
                    <div>
                      <span className="font-medium">Preferred Location:</span>
                      <span className="ml-2">{userData.preferredLocation}</span>
                    </div>
                  </div>
                )}
                {userData.languages && userData.languages.length > 0 && (
                  <div className="flex items-center text-gray-700">
                    <Globe className="w-4 h-4 mr-3 text-green-900" />
                    <div>
                      <span className="font-medium">Languages:</span>
                      <span className="ml-2">{userData.languages.join(', ')}</span>
                    </div>
                  </div>
                )}
                {userData.website && (
                  <div className="flex items-center text-gray-700">
                    <GlobeIcon className="w-4 h-4 mr-3 text-green-900" />
                    <div>
                      <span className="font-medium">Website:</span>
                      <a href={userData.website} target="_blank" rel="noopener noreferrer" 
                         className="ml-2 text-blue-600 hover:underline truncate">
                        {userData.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account & Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-900" />
                Account & Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-3 text-purple-900" />
                  <div>
                    <span className="font-medium">Username:</span>
                    <span className="ml-2">@{userData.username}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-3 text-purple-900" />
                  <div>
                    <span className="font-medium">Member Since:</span>
                    <span className="ml-2">{new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
            
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.isAdmin && (
                    <span className="bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Admin
                    </span>
                  )}
                  {userData.isGoogleAuth && (
                    <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Google Account
                    </span>
                  )}
                  {userData.isVerified && (
                    <span className="bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
                      <Award className="w-3 h-3 inline mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Office Address */}
            {(userData.officeAddress?.street || userData.officeAddress?.city) && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-900" />
                  Office Address
                </h3>
                <div className="space-y-2">
                  {userData.officeAddress.street && (
                    <div className="flex items-start text-gray-700">
                      <MapPin className="w-4 h-4 mr-3 text-orange-900 mt-1" />
                      <span>{userData.officeAddress.street}</span>
                    </div>
                  )}
                  {(userData.officeAddress.city || userData.officeAddress.state) && (
                    <div className="flex items-center text-gray-700 ml-7">
                      <span>
                        {userData.officeAddress.city}
                        {userData.officeAddress.city && userData.officeAddress.state && ', '}
                        {userData.officeAddress.state}
                      </span>
                    </div>
                  )}
                  {userData.officeAddress.pincode && (
                    <div className="flex items-center text-gray-700 ml-7">
                      <span>Pincode: {userData.officeAddress.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {(userData.socialMedia?.facebook || userData.socialMedia?.twitter || 
              userData.socialMedia?.linkedin || userData.socialMedia?.instagram) && (
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GlobeIcon className="w-5 h-5 text-pink-900" />
                  Social Media
                </h3>
                <div className="space-y-3">
                  {userData.socialMedia.facebook && (
                    <div className="flex items-center text-gray-700">
                      <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                      <a href={userData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        Facebook Profile
                      </a>
                    </div>
                  )}
                  {userData.socialMedia.twitter && (
                    <div className="flex items-center text-gray-700">
                      <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                      <a href={userData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        Twitter Profile
                      </a>
                    </div>
                  )}
                  {userData.socialMedia.linkedin && (
                    <div className="flex items-center text-gray-700">
                      <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                      <a href={userData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {userData.socialMedia.instagram && (
                    <div className="flex items-center text-gray-700">
                      <Instagram className="w-4 h-4 mr-3 text-pink-600" />
                      <a href={userData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        Instagram Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About & Specialization Section */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-900" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* About Section */}
                {userData.about && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">About</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {userData.about}
                    </p>
                  </div>
                )}
                
                {/* Interests & Specialization */}
                <div>
                  {(userData.interests && userData.interests.length > 0) && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Interests & Hobbies</h4>
                      <div className="flex flex-wrap gap-2">
                        {userData.interests.map((interest, index) => (
                          <span key={index} className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(userData.specialization && userData.specialization.length > 0) && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Specialization</h4>
                      <div className="flex flex-wrap gap-2">
                        {userData.specialization.map((spec, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Preferences Section */}
          {(userData.contactPreferences || userData.notifications) && (
            <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-900" />
                Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Preferences */}
                {userData.contactPreferences && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Contact Preferences</h4>
                    <div className="space-y-2">
                      {userData.contactPreferences.phone && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">Phone Calls</span>
                        </div>
                      )}
                      {userData.contactPreferences.email && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">Email</span>
                        </div>
                      )}
                      {userData.contactPreferences.whatsapp && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">WhatsApp</span>
                        </div>
                      )}
                      {userData.contactPreferences.sms && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">SMS</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Notification Preferences */}
                {userData.notifications && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Notification Preferences</h4>
                    <div className="space-y-2">
                      {userData.notifications.emailNotifications && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">Email Notifications</span>
                        </div>
                      )}
                      {userData.notifications.propertyAlerts && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">Property Alerts</span>
                        </div>
                      )}
                      {userData.notifications.priceDropAlerts && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">Price Drop Alerts</span>
                        </div>
                      )}
                      {userData.notifications.newPropertyAlerts && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">New Property Alerts</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info for Google Users */}
          {userData.isGoogleAuth && userData.phoneNumber === '1234567890' && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Phone Number Required</h4>
                  <p className="text-red-700 text-sm mt-1">
                    Please update your phone number for better security and communication.
                    <button
                      onClick={handleEditClick}
                      className="ml-2 text-red-600 hover:text-red-800 font-medium underline"
                    >
                      Update Now
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('favorites'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'favorites' && !isEditing
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Favorite Properties ({validLikedProperties.length})
            </button>
            <button
              onClick={() => { setActiveTab('posted'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'posted' && !isEditing
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              My Listed Properties ({postedProperties.length})
            </button>
            <button
              onClick={() => { setActiveTab('enquiries'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'enquiries' && !isEditing
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              My Enquiries ({userEnquiries.length})
            </button>
            <button
              onClick={() => { setActiveTab('edit'); setIsEditing(true); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'edit' && isEditing
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* Favorites Tab */}
          {activeTab === 'favorites' && !isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-blue-900" />
                Favorite Properties
              </h2>
              
              {validLikedProperties.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No favorite properties yet</p>
                  <button 
                    onClick={() => navigate('/properties')}
                    className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {validLikedProperties.map((item) => (
                    <PropertyCard
                      key={item.property._id}
                      property={item.property}
                      likedAt={item.likedAt}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Posted Properties Tab */}
          {activeTab === 'posted' && !isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-900" />
                My Listed Properties
              </h2>
              
              {/* Stats Overview */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{postedStats.total}</div>
                    <div className="text-sm text-gray-600">Total Listed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{postedStats.approved}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{postedStats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{postedStats.rejected}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>
              </div>
              
              {/* Filters and Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                      postedFilters.status === 'all'
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    All ({postedStats.total})
                  </button>
                  <button
                    onClick={() => handleFilterChange('status', 'approved')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      postedFilters.status === 'approved'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved ({postedStats.approved})
                  </button>
                  <button
                    onClick={() => handleFilterChange('status', 'pending')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      postedFilters.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending ({postedStats.pending})
                  </button>
                  <button
                    onClick={() => handleFilterChange('status', 'rejected')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      postedFilters.status === 'rejected'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected ({postedStats.rejected})
                  </button>
                </div>
                
                <div className="flex gap-2">
                
                  <button
                    onClick={() => handleSortChange('createdAt')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                      postedFilters.sortBy === 'createdAt'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {postedFilters.sortBy === 'createdAt' && postedFilters.sortOrder === 'desc' ? (
                      <SortDesc className="w-4 h-4" />
                    ) : (
                      <SortAsc className="w-4 h-4" />
                    )}
                    Date
                  </button>
                  <button
                    onClick={fetchPostedProperties}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {postedLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  <p className="mt-4 text-gray-600">Loading your properties...</p>
                </div>
              ) : postedProperties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {postedFilters.status === 'all' 
                      ? 'No properties listed yet' 
                      : `No ${postedFilters.status} properties found`}
                  </p>
                  <button 
                    onClick={() => navigate('/add-property')}
                    className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    List Your First Property
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Showing {postedProperties.length} propert{postedProperties.length === 1 ? 'y' : 'ies'}
                      {postedFilters.status !== 'all' && ` (${postedFilters.status})`}
                    </p>
                    <button
                      onClick={() => navigate('/add-property')}
                      className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      List New Property
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postedProperties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        property={property}
                      />
                    ))}
                  </div>
                  
                  {/* Export/Download Section */}
                  {postedProperties.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Properties</h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," 
                              + "Title,Price,Location,Status,Date\n" 
                              + postedProperties.map(p => 
                                  `"${p.title}",${p.price},"${p.city}",${p.approvalStatus},"${new Date(p.createdAt).toLocaleDateString()}"`
                                ).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "my-properties.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export as CSV
                        </button>
                        <button
                          onClick={() => {
                            const propertiesData = JSON.stringify(postedProperties, null, 2);
                            const blob = new Blob([propertiesData], { type: 'application/json' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'my-properties.json';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }}
                          className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Enquiries Tab */}
          {activeTab === 'enquiries' && !isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-900" />
                My Enquiries
              </h2>
              
              {enquiriesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  <p className="mt-4 text-gray-600">Loading enquiries...</p>
                </div>
              ) : userEnquiries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No enquiries made yet</p>
                  <button 
                    onClick={() => navigate('/properties')}
                    className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEnquiries.map((enquiry) => (
                    <EnquiryCard key={enquiry._id} enquiry={enquiry} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
              
              {editError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{editError}</p>
                  </div>
                </div>
              )}
              
              {editSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt=0.5 flex-shrink-0" />
                    <p className="text-green-700 text-sm">{editSuccess}</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSaveChanges} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-900" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="lastName"
                          value={editFormData.lastName}
                          onChange={handleEditChange}
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="gmail"
                          type="email"
                          value={editFormData.gmail}
                          onChange={handleEditChange}
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="phoneNumber"
                          value={editFormData.phoneNumber}
                          onChange={handleEditChange}
                          className={`w-full bg-white border-2 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all ${
                            userData.isGoogleAuth && editFormData.phoneNumber === '1234567890' 
                              ? 'border-red-300' 
                              : 'border-gray-200'
                          }`}
                          required
                        />
                      </div>
                      {userData.isGoogleAuth && editFormData.phoneNumber === '1234567890' && (
                        <p className="text-xs text-red-500 mt-1">
                          Please update your phone number from the default value
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Alternative Phone Number</label>
                      <div className="relative">
                        <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="alternativePhoneNumber"
                          value={editFormData.alternativePhoneNumber}
                          onChange={handleEditChange}
                          placeholder="Optional additional contact number"
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="dateOfBirth"
                          type="date"
                          value={editFormData.dateOfBirth}
                          onChange={handleEditChange}
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditChange}
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      >
                        {genderOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">User Type *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="userType"
                          value={editFormData.userType}
                          onChange={handleEditChange}
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all appearance-none"
                        >
                          {userTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-900" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Occupation</label>
                      <input
                        name="occupation"
                        value={editFormData.occupation}
                        onChange={handleEditChange}
                        placeholder="Your profession/occupation"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Company</label>
                      <input
                        name="company"
                        value={editFormData.company}
                        onChange={handleEditChange}
                        placeholder="Company name"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Specialization</label>
                      <input
                        name="specialization"
                        value={editFormData.specialization}
                        onChange={handleEditChange}
                        placeholder="e.g., Residential, Commercial, Luxury"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                      <p className="text-xs text-gray-500">
                        Separate with commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <div className="relative">
                        <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="website"
                          value={editFormData.website}
                          onChange={handleEditChange}
                          placeholder="https://example.com"
                          className="w-full bg-white border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Languages Spoken</label>
                    <input
                      name="languages"
                      value={editFormData.languages}
                      onChange={handleEditChange}
                      placeholder="e.g., English, Hindi, Kannada"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                    />
                    <p className="text-xs text-gray-500">
                      Separate languages with commas
                    </p>
                  </div>
                </div>

                {/* Section 3: Location & Preferences */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-900" />
                    Location & Preferences
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Preferred Location</label>
                    <input
                      name="preferredLocation"
                      value={editFormData.preferredLocation}
                      onChange={handleEditChange}
                      placeholder="e.g., Bangalore, Mumbai, Delhi"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                    />
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Office Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        name="officeAddress.street"
                        value={editFormData.officeAddress.street}
                        onChange={handleEditChange}
                        placeholder="Street address"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                      <input
                        name="officeAddress.city"
                        value={editFormData.officeAddress.city}
                        onChange={handleEditChange}
                        placeholder="City"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                      <input
                        name="officeAddress.state"
                        value={editFormData.officeAddress.state}
                        onChange={handleEditChange}
                        placeholder="State"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                      <input
                        name="officeAddress.pincode"
                        value={editFormData.officeAddress.pincode}
                        onChange={handleEditChange}
                        placeholder="Pincode"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Social Media */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5 text-blue-900" />
                    Social Media
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </label>
                      <input
                        name="socialMedia.facebook"
                        value={editFormData.socialMedia.facebook}
                        onChange={handleEditChange}
                        placeholder="Facebook profile URL"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </label>
                      <input
                        name="socialMedia.twitter"
                        value={editFormData.socialMedia.twitter}
                        onChange={handleEditChange}
                        placeholder="Twitter profile URL"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </label>
                      <input
                        name="socialMedia.linkedin"
                        value={editFormData.socialMedia.linkedin}
                        onChange={handleEditChange}
                        placeholder="LinkedIn profile URL"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </label>
                      <input
                        name="socialMedia.instagram"
                        value={editFormData.socialMedia.instagram}
                        onChange={handleEditChange}
                        placeholder="Instagram profile URL"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: About & Interests */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-900" />
                    About & Interests
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">About Yourself</label>
                    <textarea
                      name="about"
                      value={editFormData.about}
                      onChange={handleEditChange}
                      placeholder="Tell us about yourself, your experience, or your company..."
                      rows="4"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Interests & Hobbies</label>
                    <input
                      name="interests"
                      value={editFormData.interests}
                      onChange={handleEditChange}
                      placeholder="e.g., Real estate investing, Travel, Photography"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-900 transition-all"
                    />
                    <p className="text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>
                </div>

                {/* Section 6: Contact Preferences */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-900" />
                    Contact & Notification Preferences
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Preferences</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="contactPreferences.phone"
                            checked={editFormData.contactPreferences.phone}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">Phone Calls</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="contactPreferences.email"
                            checked={editFormData.contactPreferences.email}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">Email</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="contactPreferences.whatsapp"
                            checked={editFormData.contactPreferences.whatsapp}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">WhatsApp</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="contactPreferences.sms"
                            checked={editFormData.contactPreferences.sms}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">SMS</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="notifications.emailNotifications"
                            checked={editFormData.notifications.emailNotifications}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">Email Notifications</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="notifications.propertyAlerts"
                            checked={editFormData.notifications.propertyAlerts}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">Property Alerts</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="notifications.priceDropAlerts"
                            checked={editFormData.notifications.priceDropAlerts}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">Price Drop Alerts</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="notifications.newPropertyAlerts"
                            checked={editFormData.notifications.newPropertyAlerts}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                          />
                          <span className="text-sm text-gray-700">New Property Alerts</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={avatarLoading}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {avatarLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}