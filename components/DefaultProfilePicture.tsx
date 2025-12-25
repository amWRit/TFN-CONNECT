interface DefaultProfilePictureProps {
  name?: string
  className?: string
}

export function DefaultProfilePicture({ 
  name = "User",
  className = "h-28 w-28"
}: DefaultProfilePictureProps) {
  // Get initials from name
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")

  return (
    <div className={`${className} relative rounded-2xl border-4 border-indigo-200 shadow-md overflow-hidden`}>
      {/* Larger background circle */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500" />
      
      {/* Smaller circle with initials */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-3xl font-bold text-white">{initials || "?"}</span>
        </div>
      </div>
    </div>
  )
}
