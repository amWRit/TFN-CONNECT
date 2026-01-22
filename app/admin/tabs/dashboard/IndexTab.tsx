'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { User, Users, School, Briefcase, Award, Layers, FileText, BookOpen, Users2, Group, Contact, Rocket, Calendar, Activity, MessageSquareHeart } from 'lucide-react';
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
  openJobPostings: number;
  totalOpportunities: number;
  openOpportunities: number;
  totalEvents: number;
  upcomingEvents: number;
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
    openJobPostings: 0,
    totalPosts: 0,
    totalLocalGovs: 0,
    totalOpportunities: 0,
    openOpportunities: 0,
    totalEvents: 0,
    upcomingEvents: 0,
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
          openJobPostings: jobs.filter((j: any) => j.status === 'OPEN').length,
          totalOpportunities: opportunities.length,
          openOpportunities: opportunities.filter((o: any) => o.status === 'OPEN').length,
          totalEvents: events.length,
          upcomingEvents: events.filter((e: any) => new Date(e.startDateTime) >= new Date()).length,
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
    <Card className="py-5 px-4 md:py-7 md:px-6 flex flex-col items-center justify-center min-h-[120px] md:min-h-[150px] shadow-lg border-2 border-blue-500 rounded-lg text-center">
      <Icon className="w-8 h-8 md:w-10 md:h-10 text-blue-400 mb-2 mx-auto" />
      <p className="text-2xl md:text-4xl font-bold text-blue-600 mb-1 text-center">{value}</p>
      <p className="text-gray-600 text-sm md:text-base font-medium text-center">{label}</p>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Total People" value={stats.totalPeople} Icon={Users2} />
      <StatCard label="Alumni" value={stats.totalAlumni} Icon={AcademicCapIcon} />
      <StatCard label="Current Fellows" value={stats.totalFellows} Icon={UserGroupIcon} />
      <StatCard label="Staff" value={stats.totalStaff} Icon={Contact} />
      <StatCard label="Cohorts" value={stats.totalCohorts} Icon={Group} />
      <StatCard label="Schools" value={stats.totalSchools} Icon={School} />
      <StatCard label="Fellowships" value={stats.totalFellowships} Icon={Award} />
      <StatCard label="LocalGov" value={stats.totalLocalGovs} Icon={BuildingLibraryIcon} />
      <StatCard label="Total Jobs" value={stats.totalJobPostings} Icon={Briefcase} />
      <StatCard label="Open Jobs" value={stats.openJobPostings} Icon={BriefcaseIcon} />
      <StatCard label="Total Opportunities" value={stats.totalOpportunities} Icon={Rocket} />
      <StatCard label="Open Opportunities" value={stats.openOpportunities} Icon={Rocket} />
      <StatCard label="Total Events" value={stats.totalEvents} Icon={Calendar} />
      <StatCard label="Upcoming Events" value={stats.upcomingEvents} Icon={Calendar} />
      <StatCard label="Posts" value={stats.totalPosts} Icon={MessageSquareHeart} />
      <div className="hidden lg:block"></div>
      <div className="hidden lg:block"></div>
      <div className="hidden lg:block"></div>
    </div>
  );
}
