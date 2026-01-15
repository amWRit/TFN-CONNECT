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
      <div className="flex gap-2 mb-4 flex-wrap">
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
              className={`flex flex-row items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-colors min-w-[44px] min-h-[44px] ${
                currentView === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
              }`}
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
          <div className="flex gap-2 flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                  className={`flex flex-row items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-colors min-w-[44px] min-h-[44px] ${
                    fellowshipSubTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
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
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'skills', label: 'Skills', icon: Wrench },
              { key: 'categories', label: 'Categories', icon: Tags },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTalentSubTab(tab.key as TalentSubTab)}
                  className={`flex flex-row items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-colors min-w-[44px] min-h-[44px] ${
                    talentSubTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                  }`}
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
