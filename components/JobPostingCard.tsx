import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase, Users } from "lucide-react";

import Link from "next/link";

interface JobPostingProps {
  id: string;
  title: string;
  company?: string;
  location?: string;
  jobType: string;
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
  description,
  requiredSkills = [],
  applicants = 0,
  href,
  onView,
  createdBy,
  hideViewButton = false,
}: JobPostingProps) {
  const jobTypeColors: { [key: string]: string } = {
    full_time: "bg-red-100 text-red-700",
    part_time: "bg-red-100 text-red-700",
    contract: "bg-red-100 text-red-700",
    freelance: "bg-red-100 text-red-700",
  };

  return (
    <Card className="border-2 border-green-400 bg-white hover:shadow-xl hover:border-green-500 transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* Top Status Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition" />
      
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${jobTypeColors[jobType] || "bg-gray-100 text-gray-800"} pointer-events-none`}>
                {jobType === "full_time" && "💼 Full-time"}
                {jobType === "part_time" && "⏰ Part-time"}
                {jobType === "contract" && "📋 Contract"}
                {jobType === "freelance" && "🎯 Freelance"}
              </Badge>
              {applicants > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {applicants}
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

        <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2 bg-gray-50 p-3 rounded-lg">
          {description}
        </p>

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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            {applicants} {applicants === 1 ? "applicant" : "applicants"}
          </span>
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
