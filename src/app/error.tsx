'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retried, setRetried] = React.useState(false);

  useEffect(() => {
    console.error('CRITICAL CLIENT ERROR:', error);
    if (!retried) {
      const timer = setTimeout(() => {
        setRetried(true);
        try {
          reset();
        } catch {
          // ignore
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error, reset, retried]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin mb-4" />
      {retried && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-600">Something went wrong while loading</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/';
            }}
            className="px-4 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Reload Page
          </button>
        </div>
      )}
    </div>
  );
}
