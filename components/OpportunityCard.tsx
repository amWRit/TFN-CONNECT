import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TagIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

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
      {/* Type badges directly below title */}
      <div className="flex gap-2 flex-wrap mb-2 ml-1">
        {types.map((type) => (
          <Badge key={type} variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 uppercase flex items-center">
            <TagIcon className="h-4 w-4 text-purple-400 mr-1" /> {type}
          </Badge>
        ))}
      </div>
      <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
        <InformationCircleIcon className="h-4 w-4 text-purple-400 flex-shrink-0" />
        <span>{description}</span>
      </div>
      <div className="flex justify-end mt-3">
        <Link href={`/opportunities/${id}`}>
          <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow transition">
            View
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
