import React, { useState, useEffect } from 'react';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTractor,
    FaCheckCircle, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaCamera
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const FarmerProfile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    
    const [profile, setProfile] = useState({
        fullName: user?.name || 'Intissar Zermane',
        email: user?.email || 'intissarze1@gmail.com',
        phone: user?.phone || '+213 699 35 10 36',
        wilaya: user?.wilaya || 'Oran',
        address: user?.address || 'Your current address',
        birthDate: '1990-05-15',
        joinedDate: user?.created_at || '2024-03-10'
    });

    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [photoPreview, setPhotoPreview] = useState(user?.avatar || null);

    useEffect(() => {
        if (user) {
            const newProfile = {
                fullName: user.name || profile.fullName,
                email: user.email || profile.email,
                phone: user.phone || profile.phone,
                wilaya: user.wilaya || profile.wilaya,
                address: user.address || profile.address,
                birthDate: profile.birthDate,
                joinedDate: user.created_at || profile.joinedDate
            };
            setProfile(newProfile);
            setTempProfile(newProfile);
            setPhotoPreview(user.avatar || null);
        }
    }, [user]);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateUser({
                name: tempProfile.fullName,
                email: tempProfile.email,
                phone: tempProfile.phone,
                wilaya: tempProfile.wilaya,
                address: tempProfile.address,
                avatar: photoPreview
            });
            
            if (result.success) {
                setProfile(tempProfile);
                setIsEditing(false);
            } else {
                alert("Error saving profile: " + result.error);
            }
        } catch (error) {
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: '#faf8f0' }}>
            <div className="max-w-5xl mx-auto px-4 py-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FaTractor className="text-green-700" size={18} />
                            <span className="text-xs font-normal text-gray-500 uppercase">Farmer Profile</span>
                        </div>
                        <h1 className="text-2xl font-normal text-gray-900">My Profile</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-normal hover:bg-green-800 transition"
                        >
                            <FaEdit size={14} />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Profile Card Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            
                            {/* Photo Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative mb-4">
                                    {photoPreview ? (
                                        <img 
                                            src={photoPreview} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-green-100"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-100">
                                            <span className="text-4xl font-normal text-green-700">
                                                {profile.fullName.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-green-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-800 transition border-2 border-white">
                                            <FaCamera size={14} className="text-white" />
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <h2 className="text-xl font-normal text-gray-900 text-center">{profile.fullName}</h2>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full mt-2">
                                    <FaCheckCircle size={10} className="text-green-700" />
                                    <span className="text-[10px] font-normal text-green-700">Verified Partner</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <FaCalendarAlt className="text-green-600" size={14} />
                                    <span className="text-gray-700">Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FaMapMarkerAlt className="text-green-600" size={14} />
                                    <span className="text-gray-700">{profile.wilaya}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-normal text-gray-900 mb-6 pb-3 border-b border-gray-100">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaUser className="inline mr-1" size={10} /> Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tempProfile.fullName}
                                            onChange={e => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2">{profile.fullName}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaEnvelope className="inline mr-1" size={10} /> Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={tempProfile.email}
                                            onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2">{profile.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaPhone className="inline mr-1" size={10} /> Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tempProfile.phone}
                                            onChange={e => setTempProfile({ ...tempProfile, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2">{profile.phone}</p>
                                    )}
                                </div>

                                {/* Region */}
                                <div>
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaMapMarkerAlt className="inline mr-1" size={10} /> Region
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={tempProfile.wilaya}
                                            onChange={e => setTempProfile({ ...tempProfile, wilaya: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm bg-white"
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
                                        <p className="text-gray-800 py-2">{profile.wilaya}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaMapMarkerAlt className="inline mr-1" size={10} /> Delivery Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tempProfile.address}
                                            onChange={e => setTempProfile({ ...tempProfile, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2">{profile.address}</p>
                                    )}
                                </div>

                                {/* Birth Date */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-normal text-gray-600 mb-1">
                                        <FaCalendarAlt className="inline mr-1" size={10} /> Birth Date
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={tempProfile.birthDate}
                                            onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2">{new Date(profile.birthDate).toLocaleDateString('fr-DZ')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`flex-1 bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-normal hover:bg-green-800 transition flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <FaSave size={14} />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => { setTempProfile(profile); setIsEditing(false); }}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-normal hover:bg-gray-50 transition flex items-center gap-2"
                                    >
                                        <FaTimes size={14} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
