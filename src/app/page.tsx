'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function RootPage() {
  const router = useRouter();
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (onboardingComplete) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [onboardingComplete, router]);

  // Loading state while redirecting
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--md-sys-color-surface)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥗</div>
        <div className="title-large" style={{ color: 'var(--md-sys-color-primary)' }}>
          NutriLens
        </div>
      </div>
    </div>
  );
}
