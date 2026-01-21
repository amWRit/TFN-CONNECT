"use client";

import { useState } from 'react';
import { Users, GraduationCap, Sparkles, List, Wrench, Tags, Landmark, School, Group, Layers, MapPin, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocalGovTab from './fellowship/LocalGovTab';
import SchoolsTab from './fellowship/SchoolsTab';
import SchoolGroupsTab from './fellowship/SchoolGroupsTab';
import CohortsTab from './fellowship/CohortsTab';
import PlacementsTab from './fellowship/PlacementsTab';
import SubjectTab from './fellowship/SubjectTab';
import PeopleTab from './people/PeopleTab';
import SkillsTab from './talent/SkillsTab';
import SkillCategoryTab from './talent/SkillCategoryTab';
import ListingsTab from './listings/ListingsTab';
import { UserGroupIcon } from '@heroicons/react/24/outline';

type ManageView = 'fellowship-program' | 'people' | 'talent' | 'listings';
type FellowshipSubTab = 'localgovs' | 'schools' | 'schoolgroups' | 'cohorts' | 'placements' | 'subjects';

export default function ManageTab() {
  const [currentView, setCurrentView] = useState<ManageView>('fellowship-program');
  const [fellowshipSubTab, setFellowshipSubTab] = useState<FellowshipSubTab>('localgovs');
  // Talent sub-tabs
  type TalentSubTab = 'skills' | 'categories';
  const [talentSubTab, setTalentSubTab] = useState<TalentSubTab>('skills');

  return (
    <div className="space-y-4">
      {/* Top-level Manage tabs: Fellowship, People, Talent, Listings */}
      <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
        {[
          { key: 'fellowship-program', label: 'Fellowship', icon: GraduationCap },
          { key: 'people', label: 'People', icon: Users },
          { key: 'talent', label: 'Talent', icon: Sparkles },
          { key: 'listings', label: 'Listings', icon: List },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key as ManageView)}
              className={`flex flex-row items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${currentView === tab.key ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
              style={{ minWidth: 0, borderRadius: 0 }}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fellowship Program Group with Sub-Tabs */}
      {currentView === 'fellowship-program' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200 bg-white p-0">
            {[
              { id: 'localgovs', label: 'Local Governments', icon: Landmark },
              { id: 'schools', label: 'Schools', icon: School },
              { id: 'schoolgroups', label: 'School Groups', icon: Group },
              { id: 'cohorts', label: 'Cohorts', icon: UserGroupIcon },
              { id: 'placements', label: 'Placements', icon: MapPin },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFellowshipSubTab(tab.id as FellowshipSubTab)}
                  className={`flex flex-row items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${fellowshipSubTab === tab.id ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  style={{ minWidth: 0, borderRadius: 0 }}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Show only the selected sub-tab content */}
          {fellowshipSubTab === 'localgovs' && <LocalGovTab />}
          {fellowshipSubTab === 'schools' && <SchoolsTab />}
          {fellowshipSubTab === 'schoolgroups' && <SchoolGroupsTab />}
          {fellowshipSubTab === 'cohorts' && <CohortsTab />}
          {fellowshipSubTab === 'placements' && <PlacementsTab />}
          {fellowshipSubTab === 'subjects' && <SubjectTab />}
        </div>
      )}

      {/* People */}
      {currentView === 'people' && <PeopleTab />}

      {/* Talent Group (Skills & Categories) */}
      {currentView === 'talent' && (
        <div className="space-y-8">
          {/* Talent sub-tabs */}
          <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
            {[
              { key: 'skills', label: 'Skills', icon: Wrench },
              { key: 'categories', label: 'Categories', icon: Tags },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTalentSubTab(tab.key as TalentSubTab)}
                  className={`flex flex-row items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${talentSubTab === tab.key ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  style={{ minWidth: 0, borderRadius: 0 }}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Show only the selected sub-tab content */}
          {talentSubTab === 'skills' && <SkillsTab />}
          {talentSubTab === 'categories' && <SkillCategoryTab />}
        </div>
      )}

      {/* Listings Group */}
      {currentView === 'listings' && <ListingsTab />}
    </div>
  );
}
