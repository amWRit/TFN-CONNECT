"use client";

import { useState, useEffect } from "react";
import { DefaultProfilePicture } from "./DefaultProfilePicture";

interface ProfileImageProps {
  src?: string | null;
  name: string;
  className?: string;
  alt?: string;
}

export function ProfileImage({ src, name, className = "", alt }: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "?";
  };

  // If no src or image failed to load, show default
  if (!src || imageError) {
    const initials = getInitials(name);
    
    // If className has rounded-full, use a circular default
    if (className.includes("rounded-full")) {
      return (
        <div className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
          <span className={className.includes("h-16") ? "text-lg" : className.includes("h-8") ? "text-xs" : "text-2xl"}>
            {initials}
          </span>
        </div>
      );
    }
    
    // For other shapes, use DefaultProfilePicture
    const sizeMatch = className.match(/(h-\d+|w-\d+)/g);
    const sizeClasses = sizeMatch ? sizeMatch.join(" ") : "h-28 w-28";
    return <DefaultProfilePicture name={name} className={sizeClasses} />;
  }

  return (
    <img
      src={src}
      alt={alt || name}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

