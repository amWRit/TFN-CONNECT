import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ProfileImage";
import { Bookmark, BookmarkCheck, Edit2, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

const TYPE_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  FELLOW:  { bg: "bg-purple-100",   text: "text-purple-700",   icon: "🎓", label: "Fellow" },
  ALUMNI:   { bg: "bg-red-100",      text: "text-red-700",      icon: "⭐",  label: "Alumni" },
  STAFF:    { bg: "bg-blue-100",     text: "text-blue-700",     icon: "👔", label: "Staff" },
  LEADERSHIP: { bg: "bg-yellow-100", text: "text-yellow-800",   icon: "👑", label: "Leadership" },
  ADMIN:    { bg: "bg-green-100",    text: "text-green-700",    icon: "🛡️", label: "Admin" },
};

interface Education {
  id: string;
  name: string;
  level: string;
  institution: string;
  start: string;
  end?: string;
}
interface Experience {
  id: string;
  title: string;
  orgName: string;
  type?: string;
  description?: string;
  start: string;
  end?: string;
}

interface ProfileHeaderCardProps {
  person: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    pronouns?: string;
    profileImage?: string;
    bio?: string;
    type: string;
    empStatus: string;
    email1?: string;
    email2?: string;
    phone1?: string;
    phone2?: string;
    linkedin?: string;
    website?: string;
    educations?: Education[];
    experiences?: Experience[];
    eduStatus?: string;
  };
  personTypes?: string[];
  isAdminUser?: boolean;
  isProfileOwner?: boolean;
  showBookmark?: boolean;
  bookmarked?: boolean;
  bookmarkLoading?: boolean;
  onBookmarkToggle?: () => void;
  onEdit?: () => void;
  editing?: boolean;
  formData?: any;
  onFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave?: () => void;
  onCancel?: () => void;
  canViewPhones?: boolean;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  person,
  personTypes = [],
  isAdminUser = false,
  isProfileOwner = false,
  showBookmark = false,
  bookmarked = false,
  bookmarkLoading = false,
  onBookmarkToggle,
  onEdit,
  editing = false,
  formData,
  onFormChange,
  onSave,
  onCancel,
  canViewPhones = false,
}) => {

  const canSeeContacts = !!canViewPhones;

  if (editing && isProfileOwner && formData && onFormChange && onSave && onCancel) {
    // Improved Edit mode UI - fix input stacking and spacing
    return (
      <Card className="bg-white border-2 border-indigo-500 shadow-lg rounded-xl overflow-hidden mb-4 relative">
        {/* Save/Cancel Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            aria-label="Save"
            onClick={onSave}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            title="Save"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            aria-label="Cancel"
            onClick={onCancel}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-300 transition"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Header and Inputs - stack vertically for mobile, avoid overlap */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 pt-8 pb-6 px-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end px-6 sm:px-8 gap-6">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              <ProfileImage
                src={person.profileImage}
                name={[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ")}
                className="h-16 w-16 rounded-2xl border-4 border-indigo-200 shadow-md object-cover mb-2"
                alt={[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ")}
              />
            </div>
            <div className="flex flex-col justify-end flex-1 w-full">
              <div className="flex flex-col sm:flex-row gap-2 mb-2 w-full">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-36 placeholder:text-gray-400"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-32 placeholder:text-gray-400"
                  placeholder="Middle Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-36 placeholder:text-gray-400"
                  placeholder="Last Name"
                />
                <input
                  type="text"
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-48 placeholder:text-gray-400"
                  placeholder="Pronouns (e.g., she/her)"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="relative px-6 sm:px-8 pt-6 pb-6 bg-slate-50">
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">Person Type</label>
                <select
                  name="type"
                  value={formData.type || ""}
                  onChange={onFormChange}
                  className="w-full border border-indigo-200 px-3 py-1.5 rounded-md text-sm bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select type</option>
                  {(personTypes.length ? personTypes : ["FELLOW", "ALUMNI", "STAFF", "ADMIN", "STAFF_ALUMNI", "STAFF_ADMIN", "LEADERSHIP", "GENERAL"]) 
                    .filter((type) => {
                      if (isAdminUser || formData.type === "ADMIN" || formData.type === "STAFF_ADMIN") return true;
                      if (type === "ADMIN" || type === "STAFF_ADMIN") {
                        // Only show ADMIN/STAFF_ADMIN if it's the current value or user is admin
                        return false;
                      }
                      // ALUMNI and other types remain visible for everyone
                      return true;
                    })
                    .map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={onFormChange}
                rows={3}
                className="w-full border border-blue-200 px-3 py-2 rounded-md text-sm text-gray-700 leading-relaxed bg-white focus:border-blue-400 focus:outline-none resize-none mb-5"
                placeholder="Share a short bio about yourself..."
                maxLength={300}
              />
              {/* Two-column Info Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-4 text-sm">
                {/* Email1 (read-only) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Primary Email</label>
                  <input
                    type="email"
                    name="email1"
                    value={person.email1 || ''}
                    readOnly
                    className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded w-full cursor-not-allowed"
                  />
                </div>
                {/* Email2 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Secondary Email</label>
                  <input
                    type="email"
                    name="email2"
                    value={formData.email2}
                    onChange={onFormChange}
                    className="border border-blue-200 px-2 py-1 rounded w-full focus:border-blue-400 focus:outline-none"
                    placeholder="Secondary Email"
                  />
                </div>
                {/* Phone1 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Phone 1</label>
                  <input
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={onFormChange}
                    className="border border-green-200 px-2 py-1 rounded w-full focus:border-green-400 focus:outline-none"
                    placeholder="Phone 1"
                  />
                </div>
                {/* Phone2 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Phone 2</label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={onFormChange}
                    className="border border-green-200 px-2 py-1 rounded w-full focus:border-green-400 focus:outline-none"
                    placeholder="Phone 2"
                  />
                </div>
                {/* LinkedIn */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={onFormChange}
                    className="border border-blue-200 px-2 py-1 rounded w-full focus:border-blue-400 focus:outline-none"
                    placeholder="LinkedIn URL"
                  />
                </div>
                {/* Website */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={onFormChange}
                    className="border border-blue-200 px-2 py-1 rounded w-full focus:border-blue-400 focus:outline-none"
                    placeholder="Website URL"
                  />
                </div>
                {/* Education Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Education Status</label>
                  <select
                    name="eduStatus"
                    value={formData.eduStatus}
                    onChange={onFormChange}
                    className="border border-blue-200 px-2 py-1 rounded focus:border-blue-400 focus:outline-none"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="ENROLLED">Enrolled</option>
                    <option value="NOT_ENROLLED">Not Enrolled</option>
                  </select>
                </div>
                {/* Employment Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 mb-1">Employment Status</label>
                  <select
                    name="empStatus"
                    value={formData.empStatus}
                    onChange={onFormChange}
                    className="border border-green-200 px-2 py-1 rounded focus:border-green-400 focus:outline-none"
                  >
                    <option value="SEEKING">Seeking</option>
                    <option value="EMPLOYED">Employed</option>
                    <option value="UNEMPLOYED">Unemployed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // View mode UI (default)
  return (
    <Card className="bg-white border-2 border-indigo-500 shadow-lg rounded-xl overflow-hidden mb-4 relative">
      {/* Edit Button if profile owner, else Bookmark Button */}
      {isProfileOwner ? (
        <div className="group absolute top-4 right-4 z-10">
          <button
            aria-label={editing ? "Editing" : "Edit Profile"}
            disabled={editing}
            onClick={onEdit}
            className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 bg-white border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:scale-110 disabled:opacity-60`}
          >
            <Edit2 size={28} />
          </button>
          <span className="opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 absolute right-0 mt-2 whitespace-nowrap pointer-events-none shadow-lg" style={{top: '100%'}}>Edit</span>
        </div>
      ) : showBookmark && (
        <div className="group absolute top-4 right-4 z-10">
          <button
            aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
            disabled={bookmarkLoading}
            onClick={onBookmarkToggle}
            className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60`}
          >
            {bookmarked ? <BookmarkCheck size={28} /> : <Bookmark size={28} />}
          </button>
          <span className="opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 absolute right-0 mt-2 whitespace-nowrap pointer-events-none shadow-lg" style={{top: '100%'}}>Save</span>
        </div>
      )}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 py-4 px-2">
        <div className="flex flex-col items-center justify-center w-full">
          <ProfileImage
            src={person.profileImage}
            name={[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
            className="h-16 w-16 rounded-2xl border-4 border-indigo-200 shadow-md object-cover mb-2"
            alt={[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-0.5 text-center">
            {[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
          </h1>
          {person.pronouns && (
            <div className="text-xs font-semibold text-indigo-100 mb-1 flex items-center gap-1 justify-center">
              <User size={14} className="text-indigo-100/80" />
              <span>{person.pronouns}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 justify-center mt-0.5">
            {person.type && person.type.split("_").map((part, index) => {
              const meta = TYPE_META[part] || {
                bg: "bg-gray-100",
                text: "text-gray-700",
                icon: "⭐",
                label: part.charAt(0) + part.slice(1).toLowerCase(),
              };
              return (
                <Badge
                  key={`${person.id}-${index}`}
                  className={`text-xs font-semibold pointer-events-none ${meta.bg} ${meta.text}`}
                >
                  <span className="text-base mr-1">{meta.icon}</span>
                  {meta.label}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative px-6 sm:px-8 pt-6 pb-6">
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            {person.bio && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
                <Info className="w-5 h-5 mt-1 text-blue-400 flex-shrink-0" />
                <span className="italic text-blue-900">{person.bio}</span>
              </div>
            )}
            {/* Info Grid */}
            <div className="mb-4 text-sm">
              {!canSeeContacts && (
                <div className="mb-3 text-xs text-gray-500">
                  To connect with this person, sign in or contact the Admin.
                </div>
              )}
              {/* Each info pair in its own row, two columns per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {/* Row 1: Email (only if allowed) */}
                {canSeeContacts && (
                  <>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><path d="M22 6l-10 7L2 6" /><rect x="2" y="6" width="20" height="12" rx="2" /></svg>
                      <span>{person.email1 || <span className="text-gray-400">--</span>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><path d="M22 6l-10 7L2 6" /><rect x="2" y="6" width="20" height="12" rx="2" /></svg>
                      <span>{person.email2 || <span className="text-gray-400">--</span>}</span>
                    </div>
                  </>
                )}
                {/* Row 2: Phone (only if allowed) */}
                {canSeeContacts && (
                  <>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.28 1.6.47 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.19 1.55.34 2.36.47A2 2 0 0 1 22 16.92z" /></svg>
                      <span>{person.phone1 || <span className="text-gray-400">--</span>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.28 1.6.47 2.36a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.76.19 1.55.34 2.36.47A2 2 0 0 1 22 16.92z" /></svg>
                      <span>{person.phone2 || <span className="text-gray-400">--</span>}</span>
                    </div>
                  </>
                )}
                {/* Row 3: LinkedIn & Web */}
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-700" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                  {person.linkedin ? (
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{person.linkedin}</a>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-700" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>
                  {person.website ? (() => {
                    const url = person.website.startsWith("http://") || person.website.startsWith("https://")
                      ? person.website
                      : `https://${person.website}`;
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {person.website}
                      </a>
                    );
                  })() : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
                {/* Row 4: Employment Status & Education Status (side by side, aligned) */}
                <div className="contents">
                  {/* Employment Status (left col) */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /></svg>
                      <span className="font-medium text-gray-700">Employment Status:</span>
                      <span className="font-normal">{person.empStatus ? person.empStatus.charAt(0).toUpperCase() + person.empStatus.slice(1).toLowerCase() : 'N/A'}</span>
                    </div>
                    {person.experiences && person.experiences.length > 0 && (() => {
                      const recentExp = [...person.experiences].sort((a, b) => {
                        const aDate = new Date(a.end || a.start).getTime();
                        const bDate = new Date(b.end || b.start).getTime();
                        return bDate - aDate;
                      })[0];
                      return recentExp ? (
                        <div className="flex items-center gap-1 text-green-800 ml-4 mt-1 pl-2 border-l-2 border-green-100">Recent: {recentExp.type ? recentExp.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'N/A'} at {recentExp.orgName}</div>
                      ) : null;
                    })()}
                  </div>
                  {/* Education Status (right col) */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {/* Graduation Cap Icon */}
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" viewBox="0 0 24 24"><path d="M22 12l-10-5-10 5 10 5 10-5z"/><path d="M6 12v5c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-5"/></svg>
                      <span className="font-medium text-gray-700">Education Status:</span>
                      <span className="font-normal">{person.eduStatus ? person.eduStatus.charAt(0).toUpperCase() + person.eduStatus.slice(1).toLowerCase() : 'N/A'}</span>
                    </div>
                    {person.educations && person.educations.length > 0 && (() => {
                      const recentEdu = [...person.educations].sort((a, b) => {
                        const aDate = new Date(a.end || a.start).getTime();
                        const bDate = new Date(b.end || b.start).getTime();
                        return bDate - aDate;
                      })[0];
                      return recentEdu ? (
                        <div className="flex items-center gap-1 text-blue-800 ml-4 mt-1 pl-2 border-l-2 border-blue-100">Recent: {recentEdu.name}</div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export { ProfileHeaderCard };
