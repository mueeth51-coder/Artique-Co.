'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('[Admin Login] Submitting login request...');
      
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent and received
      });
      
      console.log('[Admin Login] Response status:', res.status);
      
      if (res.ok) {
        // Login successful - show success message briefly
        setSuccess(true);
        setPassword('');
        
        // Small delay before redirect for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('[Admin Login] Redirecting to dashboard...');
        
        // Redirect to dashboard
        router.push('/admin/dashboard');
        
        // Also refresh to ensure middleware checks the new cookie
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Invalid password. Please try again.');
        console.log('[Admin Login] Login failed:', errorData);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('[Admin Login] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Access</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your admin password to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading || success}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:bg-slate-50 disabled:text-slate-500 transition"
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && !success && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex gap-3 animate-in fade-in">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex gap-3 animate-in fade-in">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Login successful! Redirecting...</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password.trim() || success}
            className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {success ? (
              <>
                <CheckCircle size={20} />
                Success!
              </>
            ) : loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Verifying...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          This area is protected. Contact the shop owner if you need access.
        </p>
      </div>
    </div>
  );
}
