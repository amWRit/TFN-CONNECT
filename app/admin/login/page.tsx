'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Lock, UserCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
export default function AdminLoginPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [personType, setPersonType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to /admin/home if already signed in as admin
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
      router.replace('/admin/home');
    }
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      fetchPersonType();
    }
  }, [session, status]);

  async function fetchPersonType() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setPersonType(data.type || null);
      }
    } catch {
      setPersonType(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      // Set local admin session for UI
      localStorage.setItem('adminAuth', 'true');
      window.location.href = '/admin/home'; // Force full reload for UserMenu sync
    } else {
      setError(data.error || 'Login failed');
    }
  }

  // Loading state
  if (status === 'loading' || (session && personType === null)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Not Google signed in: show message and sign-in button
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md p-8 shadow-xl border-0 relative flex flex-col items-center">
          <span className="bg-blue-100 p-3 rounded-full mb-2">
            <Shield size={36} className="text-blue-600" />
          </span>
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">Admin Login</h1>
          <p className="text-gray-600 mb-6 text-center">You must first sign in with a Google account that has been given admin privileges.</p>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/admin/login' })}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <UserCircle size={20} /> Sign in with Google
          </Button>
        </Card>
      </div>
    );
  }

  // Wrong Person.type
    if (personType !== 'ADMIN' && personType !== 'STAFF_ADMIN') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-2">
          <Card className="w-full max-w-md p-8 shadow-xl border-0 relative flex flex-col items-center justify-center">
            <div className="flex flex-col items-center w-full">
              <span className="bg-red-100 p-3 rounded-full mb-4">
                <Lock size={40} className="text-red-500" />
              </span>
              <h1 className="text-3xl font-extrabold text-red-700 mb-2 text-center flex items-center gap-2">
                Access Denied
              </h1>
              <div className="flex flex-col items-center w-full">
                <span className="text-gray-700 text-lg font-medium text-center mb-2">Your account does not have admin privileges.</span>
                <span className="text-gray-500 text-sm text-center mb-4">Please contact support if you believe this is an error.</span>
                <a href="/" className="mt-2 inline-block px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-center">Go to Home</a>
              </div>
            </div>
          </Card>
        </div>
      );
    }

  // Show password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md p-8 shadow-xl border-0 relative">
        <div className="flex flex-col items-center mb-6">
          <span className="bg-blue-100 p-3 rounded-full mb-2">
            <Shield size={36} className="text-blue-600" />
          </span>
          <h1 className="text-3xl font-extrabold text-blue-700 mb-1 flex items-center gap-2">
            Admin Login
          </h1>
          {/* <p className="text-gray-500 text-sm">Sign in with your Google account and enter the admin password.</p> */}
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-center gap-2">
              <Lock size={16} className="text-red-400" /> {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold mb-2 text-blue-700 w-full">
              Enter Admin Password
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-300" />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2" disabled={loading}>
            <Shield size={18} /> {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
