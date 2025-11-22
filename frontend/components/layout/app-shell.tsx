'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { AppHeader } from './app-header';
import { RootState } from '@/lib/store';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const storedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (!storedToken) {
      router.replace('/login');
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(false);
  }, [token, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <AppHeader />
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
};
