import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ProfileImage";
import { Bookmark, BookmarkCheck, Edit2, Info, User, Briefcase, GraduationCap, Mail, Phone, Globe, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  saving?: boolean;
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
  saving = false,
}) => {

// Collapsible bio component with markdown support
const BioCollapse: React.FC<{ bio: string }> = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  const [collapseLength, setCollapseLength] = useState(200);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setCollapseLength(120); // mobile
      } else if (window.innerWidth < 1024) {
        setCollapseLength(180); // tablet
      } else {
        setCollapseLength(250); // desktop
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLong = bio.length > collapseLength;
  const displayText = !expanded && isLong ? bio.slice(0, collapseLength) + "..." : bio;
  return (
    <div className="flex flex-col bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
      <span className="italic text-blue-900 w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2 text-blue-900" />,
            h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold mt-3 mb-2 text-blue-800" />,
            h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold mt-3 mb-1 text-blue-700" />,
            h4: ({node, ...props}) => <h4 {...props} className="text-base font-semibold mt-2 mb-1 text-blue-600" />,
            h5: ({node, ...props}) => <h5 {...props} className="text-sm font-semibold mt-2 mb-1 text-blue-500" />,
            h6: ({node, ...props}) => <h6 {...props} className="text-xs font-semibold mt-2 mb-1 text-blue-400" />,
            a: ({node, ...props}) => <a {...props} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer" />,
            strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
            em: ({node, ...props}) => <em {...props} className="italic" />,
            ul: ({node, ...props}) => <ul {...props} className="list-disc ml-6" />,
            ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-6" />,
            li: ({node, ...props}) => <li {...props} className="mb-1" />,
            p: ({node, ...props}) => <p {...props} className="prose prose-blue max-w-none text-blue-900 text-sm" />,
          }}
        >
          {displayText}
        </ReactMarkdown>
      </span>
      {isLong && (
        <div className="flex justify-end mt-1">
          {!expanded ? (
            <button
              className="text-blue-600 underline text-xs font-semibold"
              onClick={() => setExpanded(true)}
              type="button"
            >
              View more
            </button>
          ) : (
            <button
              className="text-blue-600 underline text-xs font-semibold"
              onClick={() => setExpanded(false)}
              type="button"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

  // Hide contacts if type is LEADERSHIP
  const isLeadership = person.type && person.type.toUpperCase() === "LEADERSHIP";
  const canSeeContacts = !!canViewPhones && !isLeadership;

  const [statusOptions, setStatusOptions] = useState<{ eduStatus: any[]; empStatus: any[] }>({ eduStatus: [], empStatus: [] });

  useEffect(() => {
    fetch('/api/meta/status-options')
      .then(res => res.json())
      .then(data => setStatusOptions(data));
  }, []);

  if (editing && isProfileOwner && formData && onFormChange && onSave && onCancel) {
    // Improved Edit mode UI - fix input stacking and spacing
    return (
      <Card className="bg-white border-2 border-indigo-500 shadow-lg rounded-xl overflow-hidden mb-4 relative">
        {/* Save/Cancel Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            aria-label="Save"
            onClick={onSave}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition flex items-center justify-center min-w-[48px]"
            title="Save"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          {!saving && (
            <button
              aria-label="Cancel"
              onClick={onCancel}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-300 transition"
              title="Cancel"
              disabled={saving}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
                  disabled={saving}
                />
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-32 placeholder:text-gray-400"
                  placeholder="Middle Name"
                  disabled={saving}
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-36 placeholder:text-gray-400"
                  placeholder="Last Name"
                  disabled={saving}
                />
                <input
                  type="text"
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={onFormChange}
                  className="text-sm text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 outline-none px-2 py-1 rounded transition-all w-full sm:w-48 placeholder:text-gray-400"
                  placeholder="Pronouns (e.g., she/her)"
                  disabled={saving}
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
                  disabled={saving}
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
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={onFormChange}
                    rows={3}
                    className="w-full border border-blue-200 px-3 py-2 rounded-md text-sm text-gray-700 leading-relaxed bg-white focus:border-blue-400 focus:outline-none mb-1 resize-y"
                    placeholder="Share a short bio about yourself..."
                    maxLength={1000}
                    disabled={saving}
                  />
                  <div className="text-xs text-gray-500 mt-1 italic">
                    Tip: You can use Markdown to format your description.
                    Supports bold, italics, headings, ordered and unordered lists. 
                    You can use <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a>.
                  </div>
                </div>
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                  >
                    {statusOptions.eduStatus.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
                    disabled={saving}
                  >
                    {statusOptions.empStatus.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
      <div className="relative px-4 sm:px-6 pt-2 pb-2">
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            {person.bio && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-blue-900 font-medium">
                </div>
                <div className="mt-1">
                  <BioCollapse bio={person.bio} />
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="mb-4 text-sm">
              {!canSeeContacts && (
                <div className="mb-3 text-xs text-gray-500">
                  To connect with this person, sign in or contact the Admin.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {/* Only render email and phone rows if allowed */}
                {canSeeContacts && (
                  <>
                    {/* Row 1: Email */}
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-blue-500" />
                      <span>{person.email1 || <span className="text-gray-400">--</span>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-blue-500" />
                      <span>{person.email2 || <span className="text-gray-400">--</span>}</span>
                    </div>
                    {/* Row 2: Phone */}
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-green-500" />
                      <span>{person.phone1 || <span className="text-gray-400">--</span>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-green-500" />
                      <span>{person.phone2 || <span className="text-gray-400">--</span>}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Linkedin size={18} className="text-blue-700" />
                  {person.linkedin ? (
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{person.linkedin}</a>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-700" />
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
                      <Briefcase size={18} className="text-blue-500" />
                      <span className="font-medium text-gray-700">Employment Status:</span>
                      <span className="font-normal">{person.empStatus === 'NA' || !person.empStatus ? 'N/A' : person.empStatus.charAt(0).toUpperCase() + person.empStatus.slice(1).toLowerCase()}</span>
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
                      <GraduationCap size={18} className="text-blue-500" />
                      <span className="font-medium text-gray-700">Education Status:</span>
                      <span className="font-normal">{person.eduStatus === 'NA' || !person.eduStatus ? 'N/A' : person.eduStatus.charAt(0).toUpperCase() + person.eduStatus.slice(1).toLowerCase()}</span>
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
