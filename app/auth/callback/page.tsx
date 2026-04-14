"use client";

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { generateToken } from '@/lib/authApi';
import { useAuthStore } from '@/lib/authStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    if (!code) {
      router.replace('/auth/sign-in?error=auth_failed');
      return;
    }

    generateToken('google', code)
      .then(async ({ accessToken, user }) => {
        await setTokens(accessToken, user);
        const returnTo = sessionStorage.getItem('auth_return_to') ?? '/dashboard';
        sessionStorage.removeItem('auth_return_to');
        router.replace(returnTo.startsWith('/') ? returnTo : '/dashboard');
      })
      .catch(() => {
        router.replace('/auth/sign-in?error=auth_failed');
      });
  }, [searchParams, router, setTokens]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-muted text-sm">Signing you in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted text-sm">Signing you in…</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
