import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Info, Users } from "lucide-react";

import Link from "next/link";

interface JobPostingProps {
  id: string;
  title: string;
  company?: string;
  location?: string;
  jobType: string;
  status?: string;
  description: string;
  requiredSkills?: string[];
  applicants?: number;
  href?: string;
  onView?: () => void;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  hideViewButton?: boolean;
}

export function JobPostingCard({
  id,
  title,
  company,
  location,
  jobType,
  status,
  description,
  requiredSkills = [],
  // applicants = 0,
  href,
  onView,
  createdBy,
  hideViewButton = false,
}: JobPostingProps) {
  // Map enums to user-friendly labels
  const jobTypeLabels: Record<string, string> = {
    FULL_TIME: '💼 Full-time',
    PART_TIME: '⏰ Part-time',
    CONTRACT: '📋 Contract',
    INTERNSHIP: '🎓 Internship',
    VOLUNTEER: '🤝 Volunteer',
    FREELANCE: '🎯 Freelance',
    TEMPORARY: '🕒 Temporary',
    REMOTE: '🌐 Remote',
    HYBRID: '🔀 Hybrid',
  };
  const jobStatusLabels: Record<string, string> = {
    OPEN: '🟢 Open',
    FILLED: '✅ Filled',
    CLOSED: '🚫 Closed',
    PAUSED: '⏸️ Paused',
    DRAFT: '📝 Draft',
  };
  const jobTypeColor: Record<string, string> = {
    FULL_TIME: 'bg-blue-100 text-blue-700',
    PART_TIME: 'bg-purple-100 text-purple-700',
    CONTRACT: 'bg-yellow-100 text-yellow-700',
    INTERNSHIP: 'bg-green-100 text-green-700',
    VOLUNTEER: 'bg-pink-100 text-pink-700',
    FREELANCE: 'bg-orange-100 text-orange-700',
    TEMPORARY: 'bg-gray-100 text-gray-700',
    REMOTE: 'bg-cyan-100 text-cyan-700',
    HYBRID: 'bg-indigo-100 text-indigo-700',
  };
  const jobStatusColor: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-700',
    FILLED: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-200 text-gray-500',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    DRAFT: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="border-2 border-green-400 bg-white hover:shadow-xl hover:border-green-500 transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* Top Status Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition" />
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {jobType && (
                <Badge className={`${jobTypeColor[jobType] || "bg-gray-100 text-gray-800"} pointer-events-none`}>
                  {jobTypeLabels[jobType] || jobType.replace(/_/g, ' ')}
                </Badge>
              )}
              {status && (
                <Badge className={`${jobStatusColor[status] || "bg-gray-100 text-gray-800"} pointer-events-none`}>
                  {jobStatusLabels[status] || status}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
              {href ? (
                <Link href={href} className="hover:underline focus:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </CardTitle>
            {company && (
              <CardDescription className="text-sm font-semibold text-gray-700 mt-1">
                {company}
              </CardDescription>
            )}
            {createdBy && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Users className="h-4 w-4 mr-1 text-blue-400" />
                <span>Posted by {createdBy.firstName} {createdBy.lastName}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <span className="font-medium">{location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg w-full mb-0">
            {description}
          </p>
        </div>

        {requiredSkills.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold mb-2 text-gray-900 uppercase tracking-wide">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <Badge key={skill} className="text-xs font-medium bg-red-100 text-red-700 pointer-events-none">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 pt-3 border-t border-gray-100">
          {!hideViewButton && (
            href ? (
              <Link href={href} passHref>
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
                  asChild
                >
                  <span>View</span>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={onView}
                size="sm"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                View
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
