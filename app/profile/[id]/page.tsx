"use client";
import { Suspense } from 'react';
import ProfileContent from '../ProfileContent';
import { useParams } from 'next/navigation';

export default function ProfileByIdPage() {
  // This page is for /profile/[id]
  // ProfileContent will pick up the id from searchParams (for now)
  // If you want to pass the id as a prop, you can refactor ProfileContent
  return (
    <Suspense fallback={<div className="text-center py-12">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
