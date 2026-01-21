"use client";
import { useState } from "react";
import SubscriptionSettings from "@/components/SubscriptionSettings";
import { Mail, Shield, Eye, Share2, UserX } from "lucide-react";

export default function ProfileSettingsPage() {
  const [tab, setTab] = useState<'subscription' | 'privacy'>('subscription');

  return (
    <div className="max-w-5xl mx-auto p-12 bg-gradient-to-br from-yellow-50 via-blue-50 to-white rounded-2xl shadow-xl mt-10 animate-fade-in">
      <div className="flex gap-4 mb-8 border-b border-blue-200">
        <button
          className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-200 flex items-center gap-2 ${tab === 'subscription' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('subscription')}
        >
          <Mail className="w-5 h-5" />
          Subscription
        </button>
        <button
          className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-200 flex items-center gap-2 ${tab === 'privacy' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('privacy')}
        >
          <Shield className="w-5 h-5" />
          Privacy
        </button>
      </div>
      {tab === 'subscription' && <SubscriptionSettings />}
      {tab === 'privacy' && (
        <div className="p-8 text-center text-gray-500 text-lg space-y-4">
          <div className="text-2xl font-bold text-blue-700 mb-2 flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" /> Privacy Settings
          </div>
          <div>Control your privacy preferences. (Coming soon)</div>
          <ul className="text-left max-w-md mx-auto text-base text-gray-600 space-y-4">
            <li className="flex items-start gap-3"><Eye className="w-5 h-5 text-blue-400 mt-1" /><div><b>Visibility</b>: Choose who can see your profile and activity.</div></li>
            <li className="flex items-start gap-3"><Share2 className="w-5 h-5 text-green-400 mt-1" /><div><b>Data Sharing</b>: Manage what information is shared with others or third parties.</div></li>
            <li className="flex items-start gap-3"><UserX className="w-5 h-5 text-pink-400 mt-1" /><div><b>Blocked Users</b>: View and manage users you have blocked.</div></li>
          </ul>
        </div>
      )}
    </div>
  );
}
