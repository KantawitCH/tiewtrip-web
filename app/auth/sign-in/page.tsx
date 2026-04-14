"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane } from 'lucide-react';
import {
  getAuthApiBaseUrl,
  inquireProvider,
  inquireProviderRaw,
} from '@/lib/authApi';
import { useAuthStore } from '@/lib/authStore';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(
    error === 'auth_failed' ? 'Sign in failed. Please try again.' : null
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const apiBaseUrl = getAuthApiBaseUrl();

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    const returnTo = searchParams.get('returnTo');
    router.replace(returnTo?.startsWith('/') ? returnTo : '/dashboard');
  }, [isAuthenticated, isAuthLoading, router, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setInquiryError(null);
    try {
      const returnTo = searchParams.get('returnTo');
      if (returnTo) sessionStorage.setItem('auth_return_to', returnTo);
      const { authUrl } = await inquireProvider('google');
      if (!authUrl) throw new Error('No redirect URL returned from auth service.');
      window.location.href = authUrl;
    } catch {
      setInquiryError('Unable to reach sign-in service. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setInquiryError(null);
    setTestResult(null);

    try {
      const response = await inquireProviderRaw('google');
      console.log('POST /v1/auth/provider/inquiry response:', response);

      const url =
        typeof response === 'object' &&
        response !== null &&
        'json' in response &&
        typeof (response as { json?: { data?: { authUrl?: string } } }).json?.data?.authUrl === 'string'
          ? (response as { json: { data: { authUrl: string } } }).json.data.authUrl
          : null;

      setTestResult(
        url
          ? `Backend reachable. Provider inquiry returned a redirect URL: ${url}`
          : 'Backend reachable. Check the browser console for the full response.'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to reach sign-in service.';
      setInquiryError(message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-xl overflow-hidden flex">
      {/* Left panel — gradient placeholder */}
      <div className="hidden md:flex relative w-[45%] bg-coral flex-col justify-between p-8">
        {/* Top label */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
          <Plane className="w-3.5 h-3.5" />
          <span>Plan Together</span>
          <span className="flex-1 h-px bg-white/20" />
        </div>

        {/* Bottom headline */}
        <div>
          <h2 className="text-4xl font-display font-black text-white leading-tight">
            Plan trips.<br />Together.
          </h2>
          <p className="text-sm text-white/50 mt-3">
            One account for all your trip planning.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-12 py-12 gap-8">
        {/* Wordmark */}
        <p className="font-fraunces font-black tracking-tighter text-4xl text-ink">
          TiewTrip<span className="text-coral">.</span>
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-soft" />

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-display font-black text-ink">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Continue with your Google account</p>
          <p className="text-xs text-muted mt-3">
            Local auth proxy: <span className="font-mono text-ink">{apiBaseUrl}</span>
          </p>
        </div>

        {/* Error message */}
        {inquiryError && (
          <p className="text-sm text-red-500 text-center -mt-4">{inquiryError}</p>
        )}

        {/* Test result */}
        {testResult && (
          <p className="text-sm text-emerald-700 text-center -mt-4">{testResult}</p>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-soft bg-white text-ink rounded-full px-6 py-3 font-medium text-sm transition-all hover:bg-soft active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {isLoading ? 'Redirecting…' : 'Sign in with Google'}
        </button>

        <button
          onClick={handleTestConnection}
          disabled={isTestingConnection || isLoading}
          className="w-full flex items-center justify-center gap-3 border border-ink/10 bg-soft text-ink rounded-full px-6 py-3 font-medium text-sm transition-all hover:bg-cream active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTestingConnection ? 'Testing backend…' : 'Test backend connection'}
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-8 relative overflow-hidden">
      {/* Blob orbs — page background */}
      <div className="blob" style={{ width:480,height:480,background:"#FF5C3A",top:-160,right:-80,animation:"drift 8s ease-in-out infinite alternate" }} />
      <div className="blob" style={{ width:380,height:380,background:"#3DFFC0",bottom:-100,left:"10%",animation:"drift 8s 2s ease-in-out infinite alternate" }} />
      <div className="blob" style={{ width:280,height:280,background:"#FFE44D",top:"40%",right:"8%",animation:"drift 8s 4s ease-in-out infinite alternate" }} />
      <style>{`@keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(28px,18px) scale(1.08)} } .blob { position:absolute; border-radius:50%; filter:blur(90px); opacity:0.3; pointer-events:none; }`}</style>
      <Suspense fallback={
        <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-xl h-[480px] animate-pulse" />
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}
