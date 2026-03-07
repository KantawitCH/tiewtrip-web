"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('authToken', 'mock-token');
    router.push(redirect);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" size="lg">Sign In</Button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-soft">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-3xl font-display font-black text-ink">Welcome Back</h1>
          <CardDescription>Sign in to continue planning your adventures.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="space-y-4 animate-pulse h-32 bg-soft rounded-lg" />}>
            <SignInForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-soft pt-6">
          <p className="text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-coral font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
