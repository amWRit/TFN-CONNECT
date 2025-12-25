import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Calendar } from "lucide-react";

interface ExperienceCardProps {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skills?: Array<{ name: string; category: string }>;
}

export function ExperienceCard({
  title,
  company,
  location,
  startDate,
  endDate,
  description,
  skills,
}: ExperienceCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="border-2 border-indigo-400 bg-white hover:shadow-lg hover:border-indigo-500 transition rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">{company}</CardDescription>
          </div>
          {location && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 flex-shrink-0">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {formatDate(startDate)} - {endDate ? formatDate(endDate) : "Present"}
          </span>
        </div>
        {description && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{description}</p>}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.name} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
