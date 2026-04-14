"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Sparkles, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/authStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ai-builder', label: 'AI Builder', icon: Sparkles },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 border-r border-soft bg-cream flex-col hidden md:flex fixed h-full z-20">
        <div className="p-8">
          <Link href="/dashboard" className="block">
            <h1 className="font-fraunces font-black text-2xl tracking-tighter text-ink">
              TiewTrip<span className="text-coral">.</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-ink text-cream shadow-md"
                      : "text-muted hover:bg-soft hover:text-ink"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-coral" : "text-current")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-soft">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted hover:text-coral"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-soft z-50 px-6 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("flex flex-col items-center gap-1", isActive ? "text-coral" : "text-muted")}>
                  <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </div>
              </Link>
            );
          })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
