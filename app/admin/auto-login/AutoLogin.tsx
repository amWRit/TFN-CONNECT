"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminAutoLogin() {
  // Auto-login feature is currently disabled. To re-enable, uncomment the code below.
  // const router = useRouter();
  // const searchParams = useSearchParams();

  // useEffect(() => {
  //   if (!searchParams) return;
  //   const auto = searchParams.get('auto');
  //   if (auto === 'true') {
  //     // Auto-login with default credentials
  //     localStorage.setItem('adminAuth', 'true');
  //     localStorage.setItem('adminEmail', 'adminconnect@teachfornepal.org');
  //     router.push('/admin/home');
  //   }
  // }, [searchParams, router]);

  return null;
}
