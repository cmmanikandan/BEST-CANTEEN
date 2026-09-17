'use client';

import React from 'react';

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans text-[#201611]">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto text-2xl font-black">
            !
          </div>
          <h2 className="text-xl font-black text-[#201611]">Application Reload Required</h2>
          <p className="text-xs text-stone-500">
            A temporary client error occurred. Click below to reload the canteen application.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-3 bg-[#FF5722] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex-1 py-3 bg-stone-100 text-[#201611] font-bold text-xs rounded-xl"
            >
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
