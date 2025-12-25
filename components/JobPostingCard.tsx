import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase } from "lucide-react";

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
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {company && <CardDescription>{company}</CardDescription>}
          </div>
          <Badge>{jobType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4">{description}</p>

        {requiredSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{applicants} applicants</span>
          <Button onClick={onApply}>Apply Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
