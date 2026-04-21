import React, { useState, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaSave, FaTimes, FaIdCard, FaCalendarAlt, FaCamera, FaTrashAlt, FaCheckCircle, FaEdit
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BuyerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [profile, setProfile] = useState({
    fullName: user?.name || 'Ahmed Benali',
    email: user?.email || 'ahmed.benali@example.dz',
    phone: user?.phone || '0555 12 34 56',
    address: user?.address || '123 Rue des Oliviers, Alger Centre',
    wilaya: user?.wilaya || 'Algiers',
    cin: user?.cin || '12345678',
    birthDate: '1990-05-15',
    joinedDate: '2024-02-10'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [tempImagePreview, setTempImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      const newProfile = {
        fullName: user.name || profile.fullName,
        email: user.email || profile.email,
        phone: user.phone || profile.phone,
        address: user.address || profile.address,
        wilaya: user.wilaya || profile.wilaya,
        cin: user.cin || profile.cin,
        birthDate: profile.birthDate,
        joinedDate: profile.joinedDate
      };
      setProfile(newProfile);
      setTempProfile(newProfile);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditMode) {
          setTempImagePreview(reader.result);
        } else {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (isEditMode) {
      setTempImagePreview(null);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = () => {
    setProfile(tempProfile);
    if (tempImagePreview !== undefined) {
      setImagePreview(tempImagePreview);
    }

    updateUser({
      name: tempProfile.fullName,
      email: tempProfile.email,
      phone: tempProfile.phone,
      address: tempProfile.address,
      wilaya: tempProfile.wilaya,
      cin: tempProfile.cin
    });

    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setTempImagePreview(imagePreview);
    setIsEditMode(false);
  };

  const getInitials = () => {
    return profile.fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fadeIn w-full bg-[#faf8f0] pb-16 min-h-screen">

      {/* Hero Section */}
      <div
        className="relative w-full overflow-hidden flex flex-col items-center justify-center text-center text-white mb-10"
        style={{
          height: '350px',
          minHeight: '350px',
          backgroundColor: '#f4f5f0'
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')`,
            zIndex: 0,
            filter: 'blur(2px) brightness(0.7)'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative h-full w-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-center text-center text-white" style={{ zIndex: 2 }}>
          <h1 className="text-4xl md:text-4xl font-normal mb-4 text-white uppercase tracking-tight">
            Buyer <span className="font-normal text-white">Profile</span>
          </h1>
          <p className="text-xs md:text-sm font-normal text-white/90 max-w-2xl uppercase tracking-[0.2em]">
            Manage your personal credentials, contact information, and delivery foundations.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        {/* Action Bar */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-[10px] font-normal text-gray-500 tracking-widest uppercase flex items-center mb-2">
              <FaUser className="mr-1.5 text-green-700 w-3 h-3" /> BUYER PROFILE
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 font-normal">Manage your personal information</p>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-normal hover:bg-green-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FaEdit size={14} /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Container */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto items-start">

          {/* Left Sidebar Card */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">

            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                {(isEditMode ? tempImagePreview : imagePreview) ? (
                  <img
                    src={isEditMode ? tempImagePreview : imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-normal text-green-800">{getInitials()}</span>
                )}
              </div>
              {isEditMode && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-green-800 transition-colors border-2 border-white">
                  <FaCamera size={12} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h2 className="text-xl font-normal text-gray-900 mb-2">{isEditMode ? tempProfile.fullName || profile.fullName : profile.fullName}</h2>

            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-normal mb-6">
              <FaCheckCircle className="mr-1.5" /> Verified Buyer
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaIdCard className="mr-3 text-green-600 w-4 h-4" />
                <span className="truncate">{profile.cin}</span>
              </div>
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaCalendarAlt className="mr-3 text-green-600 w-4 h-4" />
                <span>Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaMapMarkerAlt className="mr-3 text-green-600 w-4 h-4" />
                <span>{profile.wilaya}</span>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-normal text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaUser className="mr-2 text-gray-400" /> Full Name
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.fullName}
                    onChange={e => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaEnvelope className="mr-2 text-gray-400" /> Email
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaPhone className="mr-2 text-gray-400" /> Phone
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.phone}
                    onChange={e => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.phone}</p>
                )}
              </div>

              {/* Wilaya Selection */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" /> Region
                </label>
                {isEditMode ? (
                  <select
                    value={tempProfile.wilaya}
                    onChange={e => setTempProfile({ ...tempProfile, wilaya: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all bg-white"
                  >
                    <option value="Algiers">Algiers</option>
                    <option value="Blida">Blida</option>
                    <option value="Oran">Oran</option>
                    <option value="Constantine">Constantine</option>
                    <option value="Setif">Setif</option>
                    <option value="Biskra">Biskra</option>
                    <option value="Tizi Ouzou">Tizi Ouzou</option>
                  </select>
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.wilaya}</p>
                )}
              </div>

              {/* Delivery Address (Takes up 2 columns like Bio) */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  Delivery Address
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.address}
                    onChange={e => setTempProfile({ ...tempProfile, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.address}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaCalendarAlt className="mr-2 text-gray-400" /> Birth Date
                </label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={tempProfile.birthDate}
                    onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{new Date(profile.birthDate).toLocaleDateString('fr-DZ')}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditMode && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="bg-green-700 text-white px-8 py-2.5 rounded-lg text-sm font-normal hover:bg-green-800 transition-all flex items-center justify-center gap-2"
                >
                  <FaSave size={14} /> Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg text-sm font-normal text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <FaTimes size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;