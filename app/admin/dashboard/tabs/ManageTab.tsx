'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GeographyTab from './GeographyTab';
import ProgramsTab from './ProgramsTab';
import PlacementsTab from './PlacementsTab';
import PeopleTab from './PeopleTab';

type ManageView = 'fellowship-program' | 'people' | 'talent';
type FellowshipSubTab = 'localgovs' | 'schools' | 'schoolgroups' | 'cohorts';

export default function ManageTab() {
  const [currentView, setCurrentView] = useState<ManageView>('fellowship-program');
  const [fellowshipSubTab, setFellowshipSubTab] = useState<FellowshipSubTab>('localgovs');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Data</h2>
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setCurrentView('fellowship-program')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'fellowship-program'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fellowship Program
          </button>
          <button
            onClick={() => setCurrentView('people')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'people'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setCurrentView('talent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'talent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Talent
          </button>
        </div>
      </div>

      {/* Fellowship Program Group with Sub-Tabs */}
      {currentView === 'fellowship-program' && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
            {[
              { id: 'localgovs', label: 'Local Governments' },
              { id: 'schools', label: 'Schools' },
              { id: 'schoolgroups', label: 'School Groups' },
              { id: 'cohorts', label: 'Cohorts' },
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
          <GeographyTab activeTab={fellowshipSubTab} />
        </div>
      )}

      {/* People */}
      {currentView === 'people' && <PeopleTab />}

      {/* Talent Group */}
      {currentView === 'talent' && (
        <div>
          <ProgramsTab />
        </div>
      )}
    </div>
  );
}
