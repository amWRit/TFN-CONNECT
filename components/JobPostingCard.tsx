import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase, Users } from "lucide-react";

interface JobPostingProps {
  id: string;
  title: string;
  company?: string;
  location?: string;
  jobType: string;
  description: string;
  requiredSkills?: string[];
  applicants?: number;
  onApply?: () => void;
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
  onApply,
}: JobPostingProps) {
  const jobTypeColors: { [key: string]: string } = {
    full_time: "bg-blue-100 text-blue-800",
    part_time: "bg-purple-100 text-purple-800",
    contract: "bg-orange-100 text-orange-800",
    freelance: "bg-green-100 text-green-800",
  };

  return (
    <Card className="border-2 border-green-400 bg-white hover:shadow-xl hover:border-green-500 transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* Top Status Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition" />
      
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={jobTypeColors[jobType] || "bg-gray-100 text-gray-800"}>
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
              {title}
            </CardTitle>
            {company && (
              <CardDescription className="text-sm font-semibold text-gray-700 mt-1">
                {company}
              </CardDescription>
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
                <Badge key={skill} variant="secondary" className="text-xs font-medium">
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
          <Button 
            onClick={onApply} 
            size="sm" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Apply Now →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
