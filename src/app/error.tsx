'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Automatically recover transparently on client render errors without showing error modal
    const timer = setTimeout(() => {
      try {
        reset();
      } catch {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [error, reset]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin" />
    </div>
  );
}
