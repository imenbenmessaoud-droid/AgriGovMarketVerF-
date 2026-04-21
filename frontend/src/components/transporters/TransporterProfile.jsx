import React, { useState, useEffect } from 'react';
import {
  FaUserTie, FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaIdCard,
  FaSave, FaTimes, FaCamera, FaUserCircle, FaBriefcase, FaCalendarAlt, FaTrashAlt, FaCheckCircle, FaEdit
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const TransporterProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [profile, setProfile] = useState({
    companyName: user?.farmName || 'Express Logistics DZ',
    representative: user?.name || 'Ahmed Benali',
    email: user?.email || 'contact@expresslogistics.dz',
    phone: user?.phone || '0555 12 34 56',
    wilaya: user?.wilaya || 'Algiers',
    commercialRegister: user?.commercialRegister || 'RC-16-0000000',
    joinedDate: '2023-11-20'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [tempAvatarPreview, setTempAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      const newProfile = {
        companyName: user.farmName || profile.companyName,
        representative: user.name || profile.representative,
        email: user.email || profile.email,
        phone: user.phone || profile.phone,
        wilaya: user.wilaya || profile.wilaya,
        commercialRegister: user.commercialRegister || profile.commercialRegister,
        joinedDate: profile.joinedDate
      };
      setProfile(newProfile);
      setTempProfile(newProfile);
    }
  }, [user]);

  const handleSave = () => {
    setProfile(tempProfile);
    if (tempAvatarPreview !== null) {
      setAvatarPreview(tempAvatarPreview);
    }

    updateUser({
      name: tempProfile.representative,
      farmName: tempProfile.companyName,
      email: tempProfile.email,
      phone: tempProfile.phone,
      wilaya: tempProfile.wilaya,
      commercialRegister: tempProfile.commercialRegister
    });

    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setTempAvatarPreview(avatarPreview);
    setIsEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditMode) {
          setTempAvatarPreview(reader.result);
        } else {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (isEditMode) {
      setTempAvatarPreview(null);
    } else {
      setAvatarPreview(null);
    }
  };

  const getInitials = () => {
    return profile.companyName.charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fadeIn w-full bg-[#faf8f0] pb-16 min-h-screen pt-12">

      <div className="max-w-5xl mx-auto px-4">
        
        {/* Action Bar */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-[10px] font-normal text-gray-500 tracking-widest uppercase flex items-center mb-2">
              <FaBuilding className="mr-1.5 text-green-700 w-3 h-3" /> TRANSPORTER PROFILE
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 font-normal">Manage your company information</p>
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
                {(isEditMode ? tempAvatarPreview : avatarPreview) ? (
                  <img
                    src={isEditMode ? tempAvatarPreview : avatarPreview}
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

            <h2 className="text-xl font-normal text-gray-900 mb-2 truncate max-w-full">{isEditMode ? tempProfile.companyName || profile.companyName : profile.companyName}</h2>

            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-normal mb-6">
              <FaCheckCircle className="mr-1.5" /> Verified Partner
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaIdCard className="mr-3 text-green-600 w-4 h-4" />
                <span className="truncate">{profile.commercialRegister}</span>
              </div>
              <div className="flex items-center text-sm font-normal text-gray-700">
                <FaCalendarAlt className="mr-3 text-green-600 w-4 h-4" />
                <span>Active since {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
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
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Company Name */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaBuilding className="mr-2 text-gray-400" /> Entity Name
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.companyName}
                    onChange={e => setTempProfile({ ...tempProfile, companyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.companyName}</p>
                )}
              </div>

              {/* Representative Name */}
              <div>
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaUserTie className="mr-2 text-gray-400" /> Representative
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.representative}
                    onChange={e => setTempProfile({ ...tempProfile, representative: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.representative}</p>
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
                    <option value="Annaba">Annaba</option>
                    <option value="Tizi Ouzou">Tizi Ouzou</option>
                  </select>
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.wilaya}</p>
                )}
              </div>

              {/* Commercial Register (Takes up remaining items) */}
              <div className="md:col-span-2">
                <label className="flex items-center text-xs font-normal text-gray-500 mb-2">
                  <FaIdCard className="mr-2 text-gray-400" /> Commercial Register (RC)
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={tempProfile.commercialRegister}
                    onChange={e => setTempProfile({ ...tempProfile, commercialRegister: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-base font-normal text-gray-900">{profile.commercialRegister}</p>
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

export default TransporterProfile;
