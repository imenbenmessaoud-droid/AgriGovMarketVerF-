import React, { useState, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaSave, FaTimes, FaShieldAlt, FaCalendarAlt, FaBriefcase, FaMapMarkerAlt,
  FaCamera, FaTrashAlt, FaEdit, FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const MinistryProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [profile, setProfile] = useState({
    fullName: user?.name || 'Director General',
    role: user?.role === 'MINISTRY' ? 'Ministry Official' : 'Ministry Administrator',
    department: 'Department of Agricultural Oversight',
    email: user?.email || 'admin@minagri.gov.dz',
    phone: user?.phone || '+213 21 00 00 00',
    location: user?.wilaya || 'Avenue Pasteur, Alger',
    joinedDate: '2023-01-15',
    bio: 'Dedicated to national food security and market transparency.'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [tempImage, setTempImage] = useState(null);
  const [tempImagePreview, setTempImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      const newProfile = {
        fullName: user.name || profile.fullName,
        role: user.role === 'MINISTRY' ? 'Ministry Official' : profile.role,
        department: profile.department,
        email: user.email || profile.email,
        phone: user.phone || profile.phone,
        location: user.wilaya || profile.location,
        joinedDate: profile.joinedDate,
        bio: profile.bio
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
          setTempImage(file);
        } else {
          setImagePreview(reader.result);
          setProfileImage(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (isEditMode) {
      setTempImagePreview(null);
      setTempImage(null);
    } else {
      setImagePreview(null);
      setProfileImage(null);
    }
  };

  const handleSave = () => {
    setProfile(tempProfile);
    if (tempImage) {
      setProfileImage(tempImage);
      setImagePreview(tempImagePreview);
    } else if (tempImagePreview === null) {
      setProfileImage(null);
      setImagePreview(null);
    }

    updateUser({
      name: tempProfile.fullName,
      email: tempProfile.email,
      phone: tempProfile.phone,
      wilaya: tempProfile.location
    });

    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setTempImagePreview(imagePreview);
    setTempImage(profileImage);
    setIsEditMode(false);
  };

  const getInitials = () => {
    return profile.fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fadeIn w-full bg-[#faf8f0] pb-16 min-h-screen pt-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Action Bar */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-[10px] font-normal text-gray-500 tracking-widest uppercase flex items-center mb-2">
              <FaShieldAlt className="mr-1.5 text-green-700 w-3 h-3" /> MINISTRY PROFILE
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 font-normal">Manage administrative credentials and departmental information.</p>
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

            <h2 className="text-xl font-normal text-gray-900 mb-2 truncate max-w-full">{isEditMode ? tempProfile.fullName || profile.fullName : profile.fullName}</h2>

            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-normal mb-6">
              <FaCheckCircle className="mr-1.5" /> Official Account
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaBriefcase className="mr-3 text-green-600 w-4 h-4" />
                <span className="truncate">{profile.role}</span>
              </div>
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaCalendarAlt className="mr-3 text-green-600 w-4 h-4" />
                <span>Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaMapMarkerAlt className="mr-3 text-green-600 w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-normal text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Administrative Information
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

              {/* Role */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaBriefcase className="mr-2 text-gray-400" /> Administrative Role
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.role}
                    onChange={e => setTempProfile({ ...tempProfile, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.role}</p>
                )}
              </div>
                
              {/* Email */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaEnvelope className="mr-2 text-gray-400" /> Official Email
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
                  <FaPhone className="mr-2 text-gray-400" /> Contact Number
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

              {/* Department */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaBuilding className="mr-2 text-gray-400" /> Department / Secretariat
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.department}
                    onChange={e => setTempProfile({ ...tempProfile, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.department}</p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" /> Location
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.location}
                    onChange={e => setTempProfile({ ...tempProfile, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.location}</p>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  Bio / Statement
                </label>
                {isEditMode ? (
                  <textarea
                    rows="3"
                    value={tempProfile.bio}
                    onChange={e => setTempProfile({ ...tempProfile, bio: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all resize-none"
                  />
                ) : (
                  <p className="text-sm font-normal text-gray-500 italic">"{profile.bio}"</p>
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

export default MinistryProfile;