'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { User, Users, School, Briefcase, Award, Layers, FileText, BookOpen, Users2, Group, Contact, Rocket, Calendar, Activity } from 'lucide-react';
import { AcademicCapIcon, UserGroupIcon, BriefcaseIcon, BuildingLibraryIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { FiUsers, FiBookOpen, FiAward } from 'react-icons/fi';

interface Stats {
  totalPeople: number;
  totalAlumni: number;
  totalFellows: number;
  totalLocalGovs: number;
  totalStaff: number;
  totalSchools: number;
  totalFellowships: number;
  totalCohorts: number;
  totalJobPostings: number;
  totalOpportunities: number;
  totalEvents: number;
  totalPosts: number;
}

export default function IndexTab() {
  const [stats, setStats] = useState<Stats>({
    totalPeople: 0,
    totalAlumni: 0,
    totalFellows: 0,
    totalStaff: 0,
    totalSchools: 0,
    totalFellowships: 0,
    totalCohorts: 0,
    totalJobPostings: 0,
    totalPosts: 0,
    totalLocalGovs: 0,
    totalOpportunities: 0,
    totalEvents: 0,
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
          localgovsRes,
          opportunitysRes,
          eventsRes,
        ] = await Promise.all([
          fetch('/api/people'),
          fetch('/api/schools'),
          fetch('/api/placements'),
          fetch('/api/fellowships'),
          fetch('/api/cohorts'),
          fetch('/api/jobs'),
          fetch('/api/feed'),
          fetch('/api/localgovs'),
          fetch('/api/opportunities'),
          fetch('/api/events'),
        ]);

        const people = (peopleRes.ok ? await peopleRes.json() : []) || [];
        const schools = (schoolsRes.ok ? await schoolsRes.json() : []) || [];
        const placements = (placementsRes.ok ? await placementsRes.json() : []) || [];
        const fellowships = (fellowshipsRes.ok ? await fellowshipsRes.json() : []) || [];
        const cohorts = (cohortsRes.ok ? await cohortsRes.json() : []) || [];
        const jobs = (jobsRes.ok ? await jobsRes.json() : []) || [];
        const posts = (postsRes.ok ? await postsRes.json() : []) || [];
        const opportunities = (opportunitysRes && opportunitysRes.ok ? await opportunitysRes.json() : []) || [];
        const events = (eventsRes && eventsRes.ok ? await eventsRes.json() : []) || [];
        const alumni = people.filter((p: any) =>
          p.type === 'ALUMNI' || p.type === 'STAFF_ALUMNI'
        );
        const staff = people.filter((p: any) =>
          p.type === 'STAFF' || p.type === 'STAFF_ALUMNI' || p.type === 'STAFF_ADMIN'
        );
        const fellows = people.filter((p: any) => p.type === 'FELLOW');
        let localgovs = [];
        if (localgovsRes && localgovsRes.ok) {
          localgovs = await localgovsRes.json();
        }

        setStats({
          totalPeople: people.length,
          totalAlumni: alumni.length,
          totalFellows: fellows.length,
          totalStaff: staff.length,
          totalSchools: schools.length,
          totalFellowships: fellowships.length,
          totalCohorts: cohorts.length,
          totalJobPostings: jobs.length,
          totalOpportunities: opportunities.length,
          totalEvents: events.length,
          totalPosts: posts.length,
          totalLocalGovs: localgovs.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ label, value, Icon }: { label: string; value: number; Icon: React.ElementType }) => (
    <Card className="py-5 px-4 md:py-7 md:px-6 flex flex-col items-center justify-center min-h-[120px] md:min-h-[150px] shadow-lg border-2 border-blue-500 rounded-lg">
      <Icon className="w-8 h-8 md:w-10 md:h-10 text-blue-400 mb-2" />
      <p className="text-2xl md:text-4xl font-bold text-blue-600 mb-1">{value}</p>
      <p className="text-gray-600 text-sm md:text-base font-medium">{label}</p>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total People" value={stats.totalPeople} Icon={Users2} />
        <StatCard label="Alumni" value={stats.totalAlumni} Icon={AcademicCapIcon} />
        <StatCard label="Current Fellows" value={stats.totalFellows} Icon={UserGroupIcon} />
        <StatCard label="Staff" value={stats.totalStaff} Icon={Contact} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Cohorts" value={stats.totalCohorts} Icon={Group} />
        <StatCard label="Schools" value={stats.totalSchools} Icon={School} />
        <StatCard label="Fellowships" value={stats.totalFellowships} Icon={Award} />
        <StatCard label="LocalGov" value={stats.totalLocalGovs} Icon={BuildingLibraryIcon} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Jobs" value={stats.totalJobPostings} Icon={Briefcase} />
        <StatCard label="Opportunities" value={stats.totalOpportunities} Icon={Rocket} />
        <StatCard label="Events" value={stats.totalEvents} Icon={Calendar} />
        <StatCard label="Posts" value={stats.totalPosts} Icon={Activity} />
      </div>
    </div>
  );
}
