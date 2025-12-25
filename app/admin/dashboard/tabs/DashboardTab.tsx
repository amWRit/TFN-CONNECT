'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Stats {
  totalPeople: number;
  totalAlumni: number;
  totalStaff: number;
  totalSchools: number;
  totalPlacements: number;
  totalFellowships: number;
  totalCohorts: number;
  totalJobPostings: number;
  totalPosts: number;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<Stats>({
    totalPeople: 0,
    totalAlumni: 0,
    totalStaff: 0,
    totalSchools: 0,
    totalPlacements: 0,
    totalFellowships: 0,
    totalCohorts: 0,
    totalJobPostings: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          peopleRes,
          schoolsRes,
          placementsRes,
          fellowshipsRes,
          cohortsRes,
          jobsRes,
          postsRes,
        ] = await Promise.all([
          fetch('/api/people'),
          fetch('/api/schools'),
          fetch('/api/placements'),
          fetch('/api/fellowships'),
          fetch('/api/cohorts'),
          fetch('/api/jobs'),
          fetch('/api/feed'),
        ]);

        const people = (peopleRes.ok ? await peopleRes.json() : []) || [];
        const schools = (schoolsRes.ok ? await schoolsRes.json() : []) || [];
        const placements = (placementsRes.ok ? await placementsRes.json() : []) || [];
        const fellowships = (fellowshipsRes.ok ? await fellowshipsRes.json() : []) || [];
        const cohorts = (cohortsRes.ok ? await cohortsRes.json() : []) || [];
        const jobs = (jobsRes.ok ? await jobsRes.json() : []) || [];
        const posts = (postsRes.ok ? await postsRes.json() : []) || [];

        const alumni = people.filter((p: any) => p.type === 'ALUMNI');
        const staff = people.filter((p: any) => p.type === 'STAFF');

        setStats({
          totalPeople: people.length,
          totalAlumni: alumni.length,
          totalStaff: staff.length,
          totalSchools: schools.length,
          totalPlacements: placements.length,
          totalFellowships: fellowships.length,
          totalCohorts: cohorts.length,
          totalJobPostings: jobs.length,
          totalPosts: posts.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <Card className="p-6">
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      <p className="text-4xl font-bold text-blue-600">{value}</p>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total People" value={stats.totalPeople} />
          <StatCard label="Alumni" value={stats.totalAlumni} />
          <StatCard label="Staff" value={stats.totalStaff} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Fellowship Program</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Schools" value={stats.totalSchools} />
          <StatCard label="Placements" value={stats.totalPlacements} />
          <StatCard label="Cohorts" value={stats.totalCohorts} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Fellowships & Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Fellowships" value={stats.totalFellowships} />
          <StatCard label="Job Postings" value={stats.totalJobPostings} />
          <StatCard label="Posts" value={stats.totalPosts} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">Future Feature</h3>
        <p className="text-blue-700 text-sm">
          Alumni will be able to create and manage their own profiles, including education, employment history, and fellowship details.
        </p>
      </div>
    </div>
  );
}
