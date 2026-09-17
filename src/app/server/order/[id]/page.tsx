'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServerOrderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/server/history');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-stone-500">
      <span>Redirecting to history...</span>
    </div>
  );
}
