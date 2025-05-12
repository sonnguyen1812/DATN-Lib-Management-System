import React, { useState } from "react";
import closeIcon from "../assets/close-square.png";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, updateProfile } from "../store/slices/authSlice";
import settingIcon from "../assets/setting.png";
import { toggleSettingPopup } from "../store/slices/popUpSlice";

const SettingPopup = () => {
    const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"
    
    // Password update states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    
    // Profile update states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const dispatch = useDispatch();
    const { loading, user } = useSelector((state) => state.auth);
    
    // Set initial values from user data
    React.useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            if (user.avatar && user.avatar.url) {
                setAvatarPreview(user.avatar.url);
            }
        }
    }, [user]);
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setAvatar(file);
        }
    };
    
    const handleUpdatePassword = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("currentPassword", currentPassword);
        data.append("newPassword", newPassword);
        data.append("confirmNewPassword", confirmNewPassword);
        dispatch(updatePassword(data));
    };
    
    const handleUpdateProfile = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", name);
        data.append("email", email);
        if (avatar) {
            data.append("avatar", avatar);
        }
        dispatch(updateProfile(data));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
            <div className="w-full bg-white rounded-lg shadow-lg sm:w-auto lg:w-1/2 2xl:w-1/3">
                <div className="p-6">
                    <header className="flex items-center justify-between mb-7 pb-5 border-b-[1px] border-black">
                        <div className="flex items-center gap-3">
                            <img
                                src={settingIcon}
                                alt="setting-icon"
                                className="bg-gray-300 p-5 rounded-lg"
                            />
                            <h3 className="text-xl font-bold">
                                Settings
                            </h3>
                        </div>
                        <img
                            src={closeIcon}
                            alt="close-icon"
                            onClick={() => dispatch(toggleSettingPopup())}
                            className="cursor-pointer"
                        />
                    </header>
                    
                    {/* Tabs */}
                    <div className="flex mb-6 border-b">
                        <button 
                            className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                        <button 
                            className={`py-2 px-4 ${activeTab === 'password' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('password')}
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-6 flex flex-col items-center">
                                <div className="relative mb-3">
                                    <img 
                                        src={avatarPreview || (user && user.avatar ? user.avatar.url : 'https://via.placeholder.com/150')} 
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-2 cursor-pointer hover:bg-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                                            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                        </svg>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500">Click to change avatar</p>
                            </div>
                            
                            <div className="mb-4 sm:flex gap-4 items-center">
                                <label className="block text-gray-900 font-medium w-full">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4 sm:flex gap-4 items-center">
                                <label className="block text-gray-900 font-medium w-full">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-4 mt-10">
                                <button
                                    type="button"
                                    onClick={() => dispatch(toggleSettingPopup())}
                                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-300"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    {loading ? "UPDATING..." : "UPDATE PROFILE"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleUpdatePassword}>
                            <div className="mb-4 sm:flex gap-4 items-center">
                                <label className="block text-gray-900 font-medium w-full">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Current Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4 sm:flex gap-4 items-center">
                                <label className="block text-gray-900 font-medium w-full">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4 sm:flex gap-4 items-center">
                                <label className="block text-gray-900 font-medium w-full">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirm New Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    type="button"
                                    onClick={() => dispatch(toggleSettingPopup())}
                                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-300"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    {loading ? "UPDATING..." : "CHANGE PASSWORD"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingPopup;
