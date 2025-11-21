"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/lib/utils";
import { User, Mail, MapPin, Calendar, Edit, Camera } from "lucide-react";
import toast from "react-hot-toast";

function ProfileContent() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    profile_picture: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        profile_picture: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_picture: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const sendData = new FormData();
      sendData.append("name", formData.name);
      sendData.append("bio", formData.bio);
      sendData.append("location", formData.location);

      if (formData.profile_picture) {
        sendData.append("profile_picture", formData.profile_picture);
      }

      const result = await updateProfile(sendData);

      if (result.success) {
        setIsEditing(false);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImagePreview(null);
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      profile_picture: null,
    });
  };

  if (!user) return null;

  const joinDate = new Date(user.created_at);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header Blue */}
          <div className="h-48 bg-blue-600 relative">
            <div className="absolute inset-0 bg-blue-700/30"></div>
          </div>

          {/* Main */}
          <div className="relative px-8 pb-10">
            {/* Profile Picture */}
            <div className="flex justify-between items-start -mt-20 mb-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gray-200">
                  <img
                    src={imagePreview || getImageUrl(user.profile_picture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-md transition">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center space-x-2 mt-4"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Edit Mode */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-1">{user.name}</h1>
                  <p className="text-gray-500">@{user.username}</p>
                </div>

                {user.bio && (
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<Mail className="w-5 h-5 text-white" />}
                    bg="bg-blue-600"
                    title="Email"
                    value={user.email}
                  />

                  {user.location && (
                    <InfoCard
                      icon={<MapPin className="w-5 h-5 text-white" />}
                      bg="bg-blue-500"
                      title="Lokasi"
                      value={user.location}
                    />
                  )}

                  <InfoCard
                    icon={<Calendar className="w-5 h-5 text-white" />}
                    bg="bg-blue-600"
                    title="Bergabung"
                    value={joinDate.toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  />

                  <InfoCard
                    icon={<User className="w-5 h-5 text-white" />}
                    bg="bg-blue-700"
                    title="Role"
                    value={user.role}
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button
                    onClick={() => router.push("/events/my-events")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-md transition"
                  >
                    Event Saya
                  </button>

                  <button
                    onClick={() => router.push("/friends")}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-md transition"
                  >
                    Teman
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, bg, title, value }) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
