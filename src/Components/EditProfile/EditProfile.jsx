import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, updateUser } = useAuth(); // Get user, loading, logout, updateUser from AuthContext

  // Editable form fields
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      setName(user.name || "");
      setPhotoURL(user.photoURL || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user, loading, navigate]);

  // SAVE PROFILE
  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateUser({ name, photoURL, phoneNumber }); // Use updateUser from AuthContext
      
      if (result.success) {
        alert("Profile Updated Successfully!");
      } else {
        alert(`Error updating profile: ${result.message}`);
      }

    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate('/login'); // Navigate after logout
  };

  // Loading State for AuthContext
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );

  // If not loading and no user, it means navigate("/login") has been called.
  if (!user) return null;

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* --- Header --- */}
          <div className="bg-white border-b border-slate-100 px-8 py-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Personal Details
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Update your photo and personal details here.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* --- Avatar Section --- */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="shrink-0">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-full border-4 border-slate-50 shadow-sm"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=Err";
                    }} // Fallback if link is broken
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-4 border-slate-50">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="https://example.com/my-photo.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Paste a direct image link to update your avatar.
                </p>
              </div>
            </div>

            {/* --- Form Fields --- */}
            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address{" "}
                  <span className="text-slate-400 font-normal">
                    (Read-only)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed focus:outline-none"
                    value={user.email}
                    readOnly
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">
                    🔒
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={phoneNumber}
                  placeholder="+1 (555) 000-0000"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Address (UI Only per original code) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* --- Actions Footer --- */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-4 border-t border-slate-100 mt-2">
              {/* Logout - Visual separation */}
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 transition text-center sm:text-left"
              >
                Sign out of account
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition shadow-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
       <Footer />
    </>
  );
};

export default EditProfile;