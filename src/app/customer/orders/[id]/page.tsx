'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerOrderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customer/orders');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-stone-500">
      <span>Redirecting to orders...</span>
    </div>
  );
}
