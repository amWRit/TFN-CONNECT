
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImage } from "@/components/ProfileImage"
import Link from "next/link"
import { Bookmark, BookmarkCheck, Users } from "lucide-react"

interface Person {
	id: string
	firstName: string
	lastName: string
	profileImage?: string
	bio?: string
	type: string
	empStatus: string
	experiences?: Array<{
		id: string
		title: string
		orgName: string
	}>
	fellowships?: Array<any>
}

const TABS = [
  // Kept for potential future metadata, but options now come from enum
	{ key: "ALL", label: "All", enabled: true },
];

const TYPE_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
	FELLOW:  { bg: "bg-purple-100",   text: "text-purple-700",   icon: "🎓", label: "Fellow" },
	ALUMNI:   { bg: "bg-red-100",      text: "text-red-700",      icon: "⭐",  label: "Alumni" },
	STAFF:    { bg: "bg-blue-100",     text: "text-blue-700",     icon: "👔", label: "Staff" },
	LEADERSHIP: { bg: "bg-yellow-100", text: "text-yellow-800",   icon: "👑", label: "Leadership" },
	ADMIN:    { bg: "bg-green-100",    text: "text-green-700",    icon: "🛡️", label: "Admin" },
};

export default function PeoplePage() {
	const [people, setPeople] = useState<Person[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("ALUMNI");
	const [cohortFilter, setCohortFilter] = useState("");
	const [empStatusFilter, setEmpStatusFilter] = useState("");
	const [nameFilter, setNameFilter] = useState("");
	const [allCohorts, setAllCohorts] = useState<string[]>([]);
	const [personTypes, setPersonTypes] = useState<string[]>([]);
	const { data: session } = useSession();
	const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		fetch("/api/people")
			.then((res) => res.json())
			.then((data) => {
				setPeople(data);
				// Extract all unique cohorts from fellowships (for alumni only)
				const cohortSet = new Set<string>();
				data.filter((p: Person) => p.type === "ALUMNI").forEach((p: any) => {
					if (p.fellowships && Array.isArray(p.fellowships)) {
						p.fellowships.forEach((f: any) => {
							if (f.cohort && f.cohort.name) cohortSet.add(f.cohort.name);
						});
					}
				});
				setAllCohorts(Array.from(cohortSet));
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		const loadPersonTypes = async () => {
			try {
				const res = await fetch("/api/meta/person-types");
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data.types)) {
						setPersonTypes(data.types);
					}
				}
			} catch (err) {
				console.error("Error fetching person types", err);
			}
		};

		loadPersonTypes();
	}, []);

	// Determine admin status (NextAuth admin or localStorage adminAuth bypass)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const localAdmin = localStorage.getItem("adminAuth") === "true";
		const sessionIsAdmin = !!(session && (session as any).user && (session as any).user.type === "ADMIN");
		setIsAdmin(localAdmin || sessionIsAdmin);
	}, [session]);

	// Fetch bookmark state for each person when session is ready
	useEffect(() => {
		if (!session || !session.user) return;
		if (isAdmin) return; // hide bookmarks and avoid extra calls for admins
		const filtered = people.filter((p) => p.type === tab);
		const fetchBookmarks = async () => {
			const states: Record<string, { bookmarked: boolean; loading: boolean }> = {};
			await Promise.all(
				filtered.map(async (person) => {
					if (session.user.id === person.id) {
						states[person.id] = { bookmarked: false, loading: false };
						return;
					}
					try {
						const res = await fetch(`/api/bookmarks/person?targetPersonId=${person.id}`);
						const data = await res.json();
						states[person.id] = { bookmarked: !!data.bookmarked, loading: false };
					} catch {
						states[person.id] = { bookmarked: false, loading: false };
					}
				})
			);
			setBookmarkStates(states);
		};
		if (filtered.length > 0) fetchBookmarks();
	}, [session, people, tab, isAdmin]);

	// Filter logic
	const filteredPeople = useMemo(() => {
		let filtered = tab === "ALL" ? people : people.filter((person) => person.type === tab);
		if (tab === "ALUMNI") {
			if (cohortFilter) {
				filtered = filtered.filter((person: any) => {
					return person.fellowships && person.fellowships.some((f: any) => f.cohort && f.cohort.name === cohortFilter);
				});
			}
			if (empStatusFilter) {
				filtered = filtered.filter((person) => person.empStatus === empStatusFilter);
			}
		}
		if (nameFilter) {
			filtered = filtered.filter((person) => (person.firstName + ' ' + person.lastName).toLowerCase().includes(nameFilter.toLowerCase()));
		}
		return filtered;
	}, [people, tab, cohortFilter, empStatusFilter, nameFilter]);

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-12">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
				{/* Filters */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
					<div className="flex-1 flex items-center sm:justify-start justify-center">
						<div className="flex items-center gap-4">
							<span>
								<span className="sr-only">Community</span>
								<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-base font-bold tracking-wide uppercase pointer-events-none">Community</Badge>
							</span>
							<div className="relative flex items-center">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
									<Users size={18} />
								</span>
								<select
										className="appearance-none pl-9 pr-12 py-2 w-52 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
									value={tab}
									onChange={e => setTab(e.target.value)}
								>
										<option value="ALL">All</option>
										{personTypes
											.filter((t) => t !== "ADMIN")
											.map((t) => (
											<option key={t} value={t}>
												{TYPE_META[t]?.label ?? t.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
											</option>
											))}
								</select>
								<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
									<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
								</span>
							</div>
						</div>
					</div>
					<div className="flex-1 flex justify-center">
						<div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap md:flex-nowrap items-center gap-3 w-full">
							{tab === "ALUMNI" && (
								<>
									<div className="flex items-center gap-2 w-full sm:w-auto">
										<label className="font-semibold text-purple-700">Cohort</label>
										<select
											className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
											value={cohortFilter}
											onChange={e => setCohortFilter(e.target.value)}
										>
											<option value="">All</option>
											{allCohorts.map((c) => (
												<option key={c} value={c}>{c}</option>
											))}
										</select>
									</div>
									<div className="flex items-center gap-2 w-full sm:w-auto">
										<label className="font-semibold text-purple-700">Employment</label>
										<select
											className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
											value={empStatusFilter}
											onChange={e => setEmpStatusFilter(e.target.value)}
										>
											<option value="">All</option>
											<option value="EMPLOYED">Employed</option>
											<option value="SEEKING">Seeking</option>
											<option value="UNEMPLOYED">Unemployed</option>
										</select>
									</div>
								</>
							)}
							<div className="flex items-center gap-2 w-full sm:flex-1">
								<label className="font-semibold text-purple-700">Name</label>
								<input
									type="text"
									className="border border-purple-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition w-full min-w-[160px]"
									placeholder="Search by name"
									value={nameFilter}
									onChange={e => setNameFilter(e.target.value)}
								/>
							</div>
						</div>
					</div>
					<div className="flex-1 flex items-center sm:justify-end justify-center"></div>
				</div>

				{/* People Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
					{filteredPeople.map((person) => {
						const isProfileOwner = session && session.user && session.user.id === person.id;
						const showBookmark = session && session.user && !isProfileOwner && !isAdmin;
						const bookmarkState = bookmarkStates[person.id] || { bookmarked: false, loading: false };
						return (
							<div key={person.id} className="relative group">
								<Link href={`/profile/${person.id}`} className="block">
									<Card className="h-full hover:shadow-2xl hover:border-blue-400 transition-all duration-300 cursor-pointer border-2 border-blue-300 bg-white rounded-2xl overflow-hidden">
										<div className={`h-1 w-full ${
											person.empStatus === "EMPLOYED"
												? "bg-gradient-to-r from-green-400 to-emerald-500"
												: person.empStatus === "SEEKING"
													? "bg-gradient-to-r from-blue-400 to-cyan-500"
													: "bg-gradient-to-r from-gray-300 to-gray-400"
										}`} />
										<CardHeader>
											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center gap-4 flex-1">
													<div className="h-16 w-16 rounded-full border-3 border-blue-100 overflow-hidden group-hover:border-blue-300 transition shadow-md">
														<ProfileImage
															src={person.profileImage}
															name={`${person.firstName} ${person.lastName}`}
															className="h-full w-full object-cover"
															alt={`${person.firstName} ${person.lastName}`}
														/>
													</div>
													<div className="flex-1">
														<div className="mb-2 flex flex-wrap gap-1">
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
												{showBookmark && (
													<button
														aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
														disabled={bookmarkState.loading}
														onClick={async (e) => {
															e.preventDefault();
															setBookmarkStates((prev) => ({
																...prev,
																[person.id]: { ...prev[person.id], loading: true },
															}));
															try {
																const res = await fetch("/api/bookmarks/person", {
																	method: bookmarkState.bookmarked ? "DELETE" : "POST",
																	headers: { "Content-Type": "application/json" },
																	body: JSON.stringify({ targetPersonId: person.id }),
																});
																if (res.ok) {
																	setBookmarkStates((prev) => ({
																		...prev,
																		[person.id]: { bookmarked: !bookmarkState.bookmarked, loading: false },
																	}));
																} else {
																	setBookmarkStates((prev) => ({
																		...prev,
																		[person.id]: { ...prev[person.id], loading: false },
																	}));
																}
															} catch {
																setBookmarkStates((prev) => ({
																	...prev,
																	[person.id]: { ...prev[person.id], loading: false },
																}));
															}
														}}
														className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarkState.bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60 ml-2`}
														style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
													>
														{bookmarkState.bookmarked ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
													</button>
												)}
											</div>
											<CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
												{person.firstName} {person.lastName}
											</CardTitle>
											{person.experiences && person.experiences[0] && (
												<div className="text-sm text-gray-600 font-medium mt-2">
													<div className="flex items-center gap-1">
														<span className="text-lg">💼</span>
														<span>{person.experiences[0].title}</span>
													</div>
													<div className="text-xs text-gray-500 mt-1">{person.experiences[0].orgName}</div>
												</div>
											)}
										</CardHeader>
										<CardContent>
											{person.bio && (
												<p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
													"{person.bio}"
												</p>
											)}
											<div className="flex items-center justify-between">
												<span
													className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-700 pointer-events-none"
												>
													{person.empStatus === "EMPLOYED" && "✓ Employed"}
													{person.empStatus === "SEEKING" && "🔍 Seeking"}
													{person.empStatus !== "EMPLOYED" && person.empStatus !== "SEEKING" && person.empStatus}
												</span>
												<span className="text-xs text-gray-400">View Profile →</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
