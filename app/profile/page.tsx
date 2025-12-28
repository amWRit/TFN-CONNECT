"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon } from "lucide-react";
import { ProfileImage } from "@/components/ProfileImage";


interface Fellowship {
  id: string;
  personId: string;
  cohortId: string;
  placementId: string;
  subjects: string[];
  createdAt: string;
  cohort?: any;
  placement?: any;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email1: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
  linkedin?: string;
  bio?: string;
  dob?: string;
  profileImage?: string;
  eduStatus: string;
  empStatus: string;
  educations: Education[];
  experiences: Experience[];
  fellowships?: Fellowship[];
  type?: string;
}

interface Education {
  id: string;
  institution: string;
  university?: string;
  level: string;
  name: string;
  sector?: string;
  start: string;
  end?: string;
}

interface Experience {
  id: string;
  orgName: string;
  title: string;
  sector: string;
  type: string;
  description?: string;
  start: string;
  end?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [person, setPerson] = useState<Person | null>(null);
  const [showFellowshipForm, setShowFellowshipForm] = useState(false);
  const [editingFellowship, setEditingFellowship] = useState<string | null>(null);
  const [fellowshipForm, setFellowshipForm] = useState<{
    cohortId: string;
    placementId: string;
    subjects: string[];
  }>({
    cohortId: "",
    placementId: "",
    subjects: [],
  });
  const [cohorts, setCohorts] = useState<{ id: string; name: string; start?: string; end?: string }[]>([]);
  const [placements, setPlacements] = useState<{ id: string; school: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingEducation, setEditingEducation] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email2: "",
    phone1: "",
    phone2: "",
    linkedin: "",
    bio: "",
    dob: "",
    eduStatus: "COMPLETED",
    empStatus: "SEEKING",
  });

  const [educationForm, setEducationForm] = useState({
    institution: "",
    university: "",
    level: "",
    name: "",
    sector: "",
    start: "",
    end: "",
  });

  const [experienceForm, setExperienceForm] = useState({
    orgName: "",
    title: "",
    sector: "",
    type: "full_time",
    description: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchProfile();
      fetchCohorts();
      fetchPlacements();
    }
  }, [status, session]);

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/cohorts");
      if (res.ok) {
        const data = await res.json();
        // Ensure start/end are present for each cohort
        setCohorts(data.map((c: any) => ({
          id: c.id,
          name: c.name,
          start: c.start,
          end: c.end
        })));
      }
    } catch (error) {
      console.error("Error fetching cohorts:", error);
    }
  };

  const fetchPlacements = async () => {
    try {
      const res = await fetch("/api/placements");
      if (res.ok) {
        const data = await res.json();
        setPlacements(data);
      }
    } catch (error) {
      console.error("Error fetching placements:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setPerson(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email2: data.email2 || "",
          phone1: data.phone1 || "",
          phone2: data.phone2 || "",
          linkedin: data.linkedin || "",
          bio: data.bio || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          eduStatus: data.eduStatus || "COMPLETED",
          empStatus: data.empStatus || "SEEKING",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
                      headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
                    });

                    if (res.ok) {
                      await fetchProfile();
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSaveEducation = async () => {
    // Validate required fields
    if (!educationForm.institution || !educationForm.level || !educationForm.name || !educationForm.start) {
      alert("Please fill in all required fields: Institution, Level, Degree Name, and Start Date");
      return;
    }

    // Validate date
    const startDate = new Date(educationForm.start);
    if (isNaN(startDate.getTime())) {
      alert("Please enter a valid start date");
      return;
    }

    if (educationForm.end) {
      const endDate = new Date(educationForm.end);
      if (isNaN(endDate.getTime())) {
        alert("Please enter a valid end date");
        return;
      }
    }

    try {
      const url = editingEducation
        ? `/api/profile/education/${editingEducation}`
        : "/api/profile/education";
      const method = editingEducation ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(educationForm),
      });

      if (res.ok) {
        await fetchProfile();
        setShowEducationForm(false);
        setEditingEducation(null);
        setEducationForm({
          institution: "",
          university: "",
          level: "",
          name: "",
          sector: "",
          start: "",
          end: "",
        });
                    } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save education");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      alert("An error occurred while saving education");
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education?")) return;

    try {
      const res = await fetch(`/api/profile/education/${id}`, {
        method: "DELETE",
      });

                        if (res.ok) {
                          await fetchProfile();
      }
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  const handleSaveExperience = async () => {
    // Validate required fields
    if (!experienceForm.orgName || !experienceForm.title || !experienceForm.sector || !experienceForm.type || !experienceForm.start) {
      alert("Please fill in all required fields: Organization, Title, Sector, Type, and Start Date");
      return;
    }

    // Validate date
    const startDate = new Date(experienceForm.start);
    if (isNaN(startDate.getTime())) {
      alert("Please enter a valid start date");
      return;
    }

    if (experienceForm.end) {
      const endDate = new Date(experienceForm.end);
      if (isNaN(endDate.getTime())) {
        alert("Please enter a valid end date");
        return;
      }
    }

    try {
      const url = editingExperience
        ? `/api/profile/experience/${editingExperience}`
        : "/api/profile/experience";
      const method = editingExperience ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experienceForm),
      });

      if (res.ok) {
        await fetchProfile();
        setShowExperienceForm(false);
        setEditingExperience(null);
        setExperienceForm({
          orgName: "",
          title: "",
          sector: "",
          type: "full_time",
          description: "",
          start: "",
          end: "",
        });
                        } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save experience");
                        }
    } catch (error) {
      console.error("Error saving experience:", error);
      alert("An error occurred while saving experience");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const res = await fetch(`/api/profile/experience/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProfile();
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Update profile immediately with new image URL for instant feedback
        if (data.imageUrl && person) {
          setPerson((prev) => prev ? { ...prev, profileImage: data.imageUrl } : null);
        }
        // Also fetch full profile to ensure everything is in sync
        await fetchProfile();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: null }),
      });

      if (res.ok) {
        await fetchProfile();
      }
    } catch (error) {
      console.error("Error removing image:", error);
      alert("An error occurred while removing image");
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!session) {
    return <div className="text-center py-12">Please sign in to view your profile.</div>;
  }

  if (!person) {
    return <div className="text-center py-12">Profile not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Edit2 size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Basic Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Basic Information</h2>
        
        {/* Profile Image Section */}
        <div className="mb-6 flex items-center gap-6">
          <div className="flex-shrink-0">
            <ProfileImage
              key={person.profileImage || 'no-image'}
              src={person.profileImage}
              name={`${person.firstName} ${person.lastName}`}
              className="h-24 w-24 rounded-full border-4 border-blue-200 object-cover"
              alt={`${person.firstName} ${person.lastName}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Profile Picture</h3>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {uploadingImage ? (
                <>
                  <Upload size={16} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon size={16} className="mr-2" />
                  {person.profileImage ? "Change Image" : "Upload Image"}
                </>
              )}
            </Button>
            {person.profileImage && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-red-600 text-red-600 hover:bg-red-50"
                onClick={handleRemoveImage}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Email</label>
              <input
                type="email"
                className="w-full border rounded p-2 bg-gray-100"
                value={person.email1}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secondary Email</label>
              <input
                type="email"
                className="w-full border rounded p-2"
                value={formData.email2}
                onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone 1</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone1}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone 2</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                className="w-full border rounded p-2"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Education Status</label>
                <select
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.eduStatus}
                  onChange={(e) => setFormData({ ...formData, eduStatus: e.target.value })}
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="ENROLLED">Enrolled</option>
                  <option value="NOT_ENROLLED">Not Enrolled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment Status</label>
                <select
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.empStatus}
                  onChange={(e) => setFormData({ ...formData, empStatus: e.target.value })}
                >
                  <option value="SEEKING">Seeking</option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div><strong>Name:</strong> {person.firstName} {person.lastName}</div>
            <div><strong>Email:</strong> {person.email1}</div>
            {person.email2 && <div><strong>Secondary Email:</strong> {person.email2}</div>}
            {person.phone1 && <div><strong>Phone 1:</strong> {person.phone1}</div>}
            {person.phone2 && <div><strong>Phone 2:</strong> {person.phone2}</div>}
            {person.linkedin && <div><strong>LinkedIn:</strong> <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600">{person.linkedin}</a></div>}
            {person.dob && <div><strong>Date of Birth:</strong> {new Date(person.dob).toLocaleDateString()}</div>}
            <div><strong>Education Status:</strong> {person.eduStatus}</div>
            <div><strong>Employment Status:</strong> {person.empStatus}</div>
            {person.bio && <div><strong>Bio:</strong> {person.bio}</div>}
          </div>
        )}
      </Card>


      {/* Fellowship (only for alumni) */}
      {person.type && person.type.toLowerCase() === "alumni" && (
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Fellowships</h2>
            {!showFellowshipForm && (
              <Button onClick={() => setShowFellowshipForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={16} className="mr-2" />
                Add Fellowship
              </Button>
            )}
          </div>

          {showFellowshipForm && (
            <div className="mb-4 p-4 border rounded space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cohort</label>
                <select
                  className="w-full border rounded p-2"
                  value={fellowshipForm.cohortId}
                  onChange={(e) => setFellowshipForm({ ...fellowshipForm, cohortId: e.target.value })}
                >
                  <option value="">Select Cohort</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Placement</label>
                <select
                  className="w-full border rounded p-2"
                  value={fellowshipForm.placementId}
                  onChange={(e) => setFellowshipForm({ ...fellowshipForm, placementId: e.target.value })}
                >
                  <option value="">Select Placement</option>
                  {placements.map((p) => (
                    <option key={p.id} value={p.id}>{p.school?.name || p.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={fellowshipForm.subjects.join(", ")}
                  onChange={(e) => setFellowshipForm({ ...fellowshipForm, subjects: e.target.value.split(",").map(s => s.trim()) })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={async () => {
                  // Save fellowship
                  let url = "/api/fellowships";
                  let method = "POST";
                  if (editingFellowship) {
                    url = `/api/fellowships/${editingFellowship}`;
                    method = "PATCH";
                  }
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      personId: person.id,
                      cohortId: fellowshipForm.cohortId,
                      placementId: fellowshipForm.placementId,
                      subjects: fellowshipForm.subjects,
                    }),
                  });
                  if (res.ok) {
                    await fetchProfile();
                    setShowFellowshipForm(false);
                    setEditingFellowship(null);
                    setFellowshipForm({ cohortId: "", placementId: "", subjects: [] });
                  } else {
                    alert("Failed to save fellowship");
                  }
                }} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setShowFellowshipForm(false);
                    setEditingFellowship(null);
                    setFellowshipForm({ cohortId: "", placementId: "", subjects: [] });
                  }}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {person.fellowships?.map((fellow) => {
              const cohort = cohorts.find(c => c.id === fellow.cohortId);
              const placement = placements.find(p => p.id === fellow.placementId);
              return (
                <div key={fellow.id} className="p-4 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">Cohort: {cohort?.name || fellow.cohortId}</div>
                    <div className="text-sm text-gray-600">Start: {cohort?.start ? new Date(cohort.start).toLocaleDateString() : "-"} | End: {cohort?.end ? new Date(cohort.end).toLocaleDateString() : "-"}</div>
                    <div className="text-sm text-gray-600">Placement: {placement?.school?.name || fellow.placementId}</div>
                    <div className="text-sm text-gray-500">Subjects: {fellow.subjects.join(", ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingFellowship(fellow.id);
                        setShowFellowshipForm(true);
                        setFellowshipForm({
                          cohortId: fellow.cohortId,
                          placementId: fellow.placementId,
                          subjects: fellow.subjects,
                        });
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this fellowship?")) return;
                        const res = await fetch(`/api/fellowships/${fellow.id}`, { method: "DELETE" });
                        if (res.ok) {
                          await fetchProfile();
                        } else {
                          alert("Failed to delete fellowship");
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
            {(!person.fellowships || person.fellowships.length === 0) && !showFellowshipForm && (
              <div className="text-gray-500 text-center py-4">No fellowship records yet.</div>
            )}
          </div>
        </Card>
      )}
      
      {/* Education */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600">Education</h2>
          {!showEducationForm && (
            <Button onClick={() => setShowEducationForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Add Education
            </Button>
          )}
        </div>

        {showEducationForm && (
          <div className="mb-4 p-4 border rounded space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.institution}
                  onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">University</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.university}
                  onChange={(e) => setEducationForm({ ...educationForm, university: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.level}
                  onChange={(e) => setEducationForm({ ...educationForm, level: e.target.value })}
                  placeholder="e.g., Bachelors, Masters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Degree Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.name}
                  onChange={(e) => setEducationForm({ ...educationForm, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sector</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={educationForm.sector}
                onChange={(e) => setEducationForm({ ...educationForm, sector: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.start}
                  onChange={(e) => setEducationForm({ ...educationForm, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={educationForm.end}
                  onChange={(e) => setEducationForm({ ...educationForm, end: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEducation} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setShowEducationForm(false);
                  setEditingEducation(null);
                  setEducationForm({
                    institution: "",
                    university: "",
                    level: "",
                    name: "",
                    sector: "",
                    start: "",
                    end: "",
                  });
                }}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {person.educations?.map((edu) => (
            <div key={edu.id} className="p-4 border rounded">
              {editingEducation === edu.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Institution</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.institution}
                        onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">University</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.university}
                        onChange={(e) => setEducationForm({ ...educationForm, university: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Level</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.level}
                        onChange={(e) => setEducationForm({ ...educationForm, level: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Degree Name</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.name}
                        onChange={(e) => setEducationForm({ ...educationForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.start}
                        onChange={(e) => setEducationForm({ ...educationForm, start: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={educationForm.end}
                        onChange={(e) => setEducationForm({ ...educationForm, end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEducation} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Save size={16} className="mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingEducation(null);
                        setEducationForm({
                          institution: "",
                          university: "",
                          level: "",
                          name: "",
                          sector: "",
                          start: "",
                          end: "",
                        });
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{edu.name}</div>
                    <div className="text-sm text-gray-600">{edu.institution}</div>
                    {edu.university && <div className="text-sm text-gray-600">{edu.university}</div>}
                    <div className="text-sm text-gray-500">
                      {new Date(edu.start).toLocaleDateString()} - {edu.end ? new Date(edu.end).toLocaleDateString() : "Present"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingEducation(edu.id);
                        setEducationForm({
                          institution: edu.institution,
                          university: edu.university || "",
                          level: edu.level,
                          name: edu.name,
                          sector: edu.sector || "",
                          start: new Date(edu.start).toISOString().split("T")[0],
                          end: edu.end ? new Date(edu.end).toISOString().split("T")[0] : "",
                        });
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteEducation(edu.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {(!person.educations || person.educations.length === 0) && !showEducationForm && (
            <div className="text-gray-500 text-center py-4">No education records yet.</div>
          )}
        </div>
      </Card>

      {/* Experience */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600">Experience</h2>
          {!showExperienceForm && (
            <Button onClick={() => setShowExperienceForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Add Experience
            </Button>
          )}
        </div>

        {showExperienceForm && (
          <div className="mb-4 p-4 border rounded space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.orgName}
                  onChange={(e) => setExperienceForm({ ...experienceForm, orgName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.title}
                  onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sector</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.sector}
                  onChange={(e) => setExperienceForm({ ...experienceForm, sector: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.type}
                  onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="fellowship">Fellowship</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={experienceForm.description}
                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.start}
                  onChange={(e) => setExperienceForm({ ...experienceForm, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={experienceForm.end}
                  onChange={(e) => setExperienceForm({ ...experienceForm, end: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveExperience} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setShowExperienceForm(false);
                  setEditingExperience(null);
                  setExperienceForm({
                    orgName: "",
                    title: "",
                    sector: "",
                    type: "full_time",
                    description: "",
                    start: "",
                    end: "",
                  });
                }}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {person.experiences?.map((exp) => (
            <div key={exp.id} className="p-4 border rounded">
              {editingExperience === exp.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Organization</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.orgName}
                        onChange={(e) => setExperienceForm({ ...experienceForm, orgName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.title}
                        onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sector</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.sector}
                        onChange={(e) => setExperienceForm({ ...experienceForm, sector: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.type}
                        onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="fellowship">Fellowship</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.start}
                        onChange={(e) => setExperienceForm({ ...experienceForm, start: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={experienceForm.end}
                        onChange={(e) => setExperienceForm({ ...experienceForm, end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveExperience} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Save size={16} className="mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingExperience(null);
                        setExperienceForm({
                          orgName: "",
                          title: "",
                          sector: "",
                          type: "full_time",
                          description: "",
                          start: "",
                          end: "",
                        });
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-sm text-gray-600">{exp.orgName}</div>
                    <div className="text-sm text-gray-500">{exp.sector} • {exp.type}</div>
                    {exp.description && <div className="text-sm mt-2">{exp.description}</div>}
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(exp.start).toLocaleDateString()} - {exp.end ? new Date(exp.end).toLocaleDateString() : "Present"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingExperience(exp.id);
                        setExperienceForm({
                          orgName: exp.orgName,
                          title: exp.title,
                          sector: exp.sector,
                          type: exp.type,
                          description: exp.description || "",
                          start: new Date(exp.start).toISOString().split("T")[0],
                          end: exp.end ? new Date(exp.end).toISOString().split("T")[0] : "",
                        });
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteExperience(exp.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {(!person.experiences || person.experiences.length === 0) && !showExperienceForm && (
            <div className="text-gray-500 text-center py-4">No experience records yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
