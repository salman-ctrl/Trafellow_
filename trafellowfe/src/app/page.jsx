"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
export default function Home() {
const router = useRouter();
const { isAuthenticated, loading } = useAuth();
useEffect(() => {
if (!loading) {
if (isAuthenticated) {
router.push('/dashboard');
} else {
router.push('/login');
}
}
}, [isAuthenticated, loading, router]);
return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
<div className="text-center text-white">
<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
<p className="text-xl font-semibold">Loading Trafellow...</p>
</div>
</div>
);
}