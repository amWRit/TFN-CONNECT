import React from "react";


import Link from "next/link";

interface OpportunityCardProps {
  id: string;
  title: string;
  description: string;
  types: string[];
  status: string;
}


const OpportunityCard: React.FC<OpportunityCardProps> = ({ id, title, description, types, status }) => {
  return (
    <div className="border-2 border-purple-400 hover:border-purple-600 transition-all duration-300 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-purple-700">
          <Link href={`/opportunities/${id}`} className="hover:underline">{title}</Link>
        </h2>
        <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{status}</span>
      </div>
      <div className="mb-2 text-sm text-gray-600">{description}</div>
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => (
          <span key={type} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium uppercase">{type}</span>
        ))}
      </div>
    </div>
  );
};

export default OpportunityCard;
