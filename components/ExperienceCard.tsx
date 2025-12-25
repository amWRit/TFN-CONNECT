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
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{company}</CardDescription>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="h-4 w-4" />
          {formatDate(startDate)} -{" "}
          {endDate ? formatDate(endDate) : "Present"}
        </div>
        {description && <p className="text-sm text-gray-700 mb-3">{description}</p>}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.name} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
