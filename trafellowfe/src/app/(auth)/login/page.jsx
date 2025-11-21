"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    name: "", 
    username: "",
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(loginData);
    
    setLoading(false);
    // Navigation handled by AuthContext
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...dataToSend } = registerData;
    const result = await register(dataToSend);
    
    setLoading(false);
    
    if (result.success) {
      // Navigation handled by AuthContext
    }
  };

  const flipToRegister = () => {
    setIsFlipped(true);
  };

  const flipToLogin = () => {
    setIsFlipped(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 py-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/background/login/login.png"
          alt="Rumah Gadang"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-800/20"></div>
      </div>

      {/* Flip Card Container */}
      <div className="relative w-full max-w-md my-8" style={{ perspective: "1000px" }}>
        {/* Ornamen Atas */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-12 bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-[50%] shadow-xl z-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-[50%]"></div>
        </div>

        {/* Flip Card */}
        <div 
          className="relative w-full transition-transform duration-700 ease-in-out"
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          {/* LOGIN CARD - Front */}
          <div 
            className="w-full"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)"
            }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-blue-200/50 p-8 relative overflow-hidden">
              
              {/* Decorative Corner Patterns */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500/30 rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500/30 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500/30 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500/30 rounded-br-3xl"></div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="blue-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <circle cx="40" cy="40" r="2" fill="#3B82F6"/>
                      <circle cx="0" cy="0" r="2" fill="#3B82F6"/>
                      <circle cx="80" cy="80" r="2" fill="#3B82F6"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#blue-pattern)"/>
                </svg>
              </div>

              {/* Title */}
              <div className="text-center mb-8 relative z-10">
                <div className="inline-block">
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 mb-2">
                    Welcome To Trafellow
                  </h2>
                  <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 text-sm mt-3 font-medium">Platform Wisata Sumatera Barat</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5 relative z-10">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800"
                    required
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">atau</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-4">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={flipToRegister}
                    className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    Register
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* REGISTER CARD - Back */}
          <div 
            className="absolute top-0 left-0 w-full"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-blue-200/50 p-8 relative overflow-hidden">
              
              {/* Decorative Corner Patterns */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500/30 rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500/30 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500/30 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500/30 rounded-br-3xl"></div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="blue-pattern-register" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <circle cx="40" cy="40" r="2" fill="#3B82F6"/>
                      <circle cx="0" cy="0" r="2" fill="#3B82F6"/>
                      <circle cx="80" cy="80" r="2" fill="#3B82F6"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#blue-pattern-register)"/>
                </svg>
              </div>

              {/* Title */}
              <div className="text-center mb-5 relative z-10">
                <div className="inline-block">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 mb-2">
                    Join Trafellow
                  </h2>
                  <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 text-sm mt-2 font-medium">Mulai petualangan Anda di Sumatera Barat</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 relative z-10">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 text-sm"
                    required
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-50/50 border-2 border-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-800 text-sm"
                    required
                  />
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold rounded-xl py-2.5 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-4 text-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">atau</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={flipToLogin}
                    className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ornamen Bawah */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
          <div className="w-3 h-3 bg-blue-700 rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-16 left-16 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
    </div>
  );
}