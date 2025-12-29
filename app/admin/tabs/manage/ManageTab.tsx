"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocalGovTab from './fellowship/LocalGovTab';
import SchoolsTab from './fellowship/SchoolsTab';
import SchoolGroupsTab from './fellowship/SchoolGroupsTab';
import CohortsTab from './fellowship/CohortsTab';
import PlacementsTab from './fellowship/PlacementsTab';
import PeopleTab from './people/PeopleTab';
import SkillsTab from './talent/SkillsTab';
import SkillCategoryTab from './talent/SkillCategoryTab';

type ManageView = 'fellowship-program' | 'people' | 'talent';
type FellowshipSubTab = 'localgovs' | 'schools' | 'schoolgroups' | 'cohorts' | 'placements';

export default function ManageTab() {
  const [currentView, setCurrentView] = useState<ManageView>('fellowship-program');
  const [fellowshipSubTab, setFellowshipSubTab] = useState<FellowshipSubTab>('localgovs');

  return (
    <div className="space-y-4">
      {/* Top-level Manage tabs: Fellowship, People, Talent */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setCurrentView('fellowship-program')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === 'fellowship-program'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
        >
          Fellowship
        </button>
        <button
          onClick={() => setCurrentView('people')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === 'people'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
        >
          People
        </button>
        <button
          onClick={() => setCurrentView('talent')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === 'talent'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
        >
          Talent
        </button>
      </div>

      {/* Fellowship Program Group with Sub-Tabs */}
      {currentView === 'fellowship-program' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
            {[
              { id: 'localgovs', label: 'Local Governments' },
              { id: 'schools', label: 'Schools' },
              { id: 'schoolgroups', label: 'School Groups' },
              { id: 'cohorts', label: 'Cohorts' },
              { id: 'placements', label: 'Placements' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFellowshipSubTab(tab.id as FellowshipSubTab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  fellowshipSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Show only the selected sub-tab content */}
          {fellowshipSubTab === 'localgovs' && <LocalGovTab />}
          {fellowshipSubTab === 'schools' && <SchoolsTab />}
          {fellowshipSubTab === 'schoolgroups' && <SchoolGroupsTab />}
          {fellowshipSubTab === 'cohorts' && <CohortsTab />}
          {fellowshipSubTab === 'placements' && <PlacementsTab />}
        </div>
      )}

      {/* People */}
      {currentView === 'people' && <PeopleTab />}

      {/* Talent Group (Skills) */}
      {currentView === 'talent' && (
        <div className="space-y-8">
          <SkillCategoryTab />
          <SkillsTab />
        </div>
      )}
    </div>
  );
}
