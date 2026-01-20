
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImage } from "@/components/ProfileImage"
import Link from "next/link"
import { Bookmark, BookmarkCheck, Users, Filter } from "lucide-react"

interface Person {
	id: string
	firstName: string
	middleName?: string
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
	const [allCohorts, setAllCohorts] = useState<{id: string; name: string}[]>([]);
	const [personTypes, setPersonTypes] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const pageSize = 24;
	const { data: session } = useSession();
	const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});
	const [isAdmin, setIsAdmin] = useState(false);
	// Collapsible filter state for small screens
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		fetch("/api/people")
			.then((res) => res.json())
			.then((data) => {
				setPeople(data);
				setLoading(false);
			});
	}, []);

	// Fetch cohorts from the cohorts API
	useEffect(() => {
		fetch("/api/cohorts")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					const cohorts = data
						.filter((c: any) => c.id && c.name)
						.map((c: any) => ({ id: String(c.id), name: String(c.name) }));
					setAllCohorts(cohorts);
				}
			})
			.catch((err) => {
				console.error("Error fetching cohorts", err);
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
		let filtered = people;
		if (tab === "ALL") {
			// Show all
		} else if (tab === "ALUMNI") {
			// Include both ALUMNI and STAFF_ALUMNI
			filtered = filtered.filter((person) => person.type === "ALUMNI" || person.type === "STAFF_ALUMNI");
		} else if (tab === "STAFF") {
			// Include both STAFF and STAFF_ALUMNI and STAFF_ADMIN
			filtered = filtered.filter((person) => person.type === "STAFF" || person.type === "STAFF_ALUMNI" || person.type === "STAFF_ADMIN");
		} else {
			filtered = filtered.filter((person) => person.type === tab);
		}
		if (tab === "ALUMNI") {
			if (cohortFilter) {
				filtered = filtered.filter((person: any) => {
					return person.fellowships && person.fellowships.some((f: any) => 
						f.cohortId === cohortFilter || (f.cohort && f.cohort.id === cohortFilter)
					);
				});
			}
			if (empStatusFilter) {
				filtered = filtered.filter((person) => person.empStatus === empStatusFilter);
			}
		}
		if (nameFilter) {
			filtered = filtered.filter((person) => {
				const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
				return fullName.toLowerCase().includes(nameFilter.toLowerCase());
			});
		}
		// Sort by name ascending
		filtered = [...filtered].sort((a, b) => {
			const nameA = [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ').toLowerCase();
			const nameB = [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ').toLowerCase();
			return nameA.localeCompare(nameB);
		});
		return filtered;
	}, [people, tab, cohortFilter, empStatusFilter, nameFilter]);

	// Reset to first page whenever filters or tab change
	useEffect(() => {
		setPage(1);
	}, [tab, cohortFilter, empStatusFilter, nameFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredPeople.length / pageSize));
	const paginatedPeople = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filteredPeople.slice(start, start + pageSize);
	}, [filteredPeople, page, pageSize]);

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-12">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 pt-2 pb-8 sm:pt-4 sm:pb-10">
				{/* Filters - Collapsible on small screens */}
				<div className="sticky top-16 z-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-2">
					{/* Row for Community label and Show Filters button on small screens */}
					<div className="flex flex-row items-center justify-between w-full sm:w-auto mb-1 sm:mb-0">
						<span>
							<span className="sr-only">Community</span>
							<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 font-bold tracking-wide uppercase pointer-events-none text-base text-sm px-4 sm:px-6 py-2">Community</Badge>
						</span>
						{/* Collapsible filter toggle for small screens */}
						<button
							type="button"
							className="px-3 py-1 rounded border border-purple-300 text-purple-700 bg-white text-sm font-medium shadow-sm hover:bg-purple-50 transition sm:hidden ml-2 flex items-center gap-2"
							onClick={() => setShowFilters((v) => !v)}
						>
							<Filter size={16} className="inline-block" />
							{showFilters ? "Hide Filters" : "Show Filters"}
						</button>
					</div>
					<div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
						{/* Filter section: always visible on sm+, collapsible on small screens */}
						<div
							className={`w-full sm:flex-1 flex justify-center ${showFilters ? "" : "hidden"} sm:flex`}
						>
							<div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap md:flex-nowrap items-center gap-3 w-full">
								<div className="relative flex items-center w-full sm:w-auto">
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
								{tab === "ALUMNI" && (
									<>
										<div className="flex items-center gap-2 w-full sm:w-auto">
											<label className="font-semibold text-purple-700">Cohort</label>
											<select
												className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition min-w-[140px]"
												value={cohortFilter}
												onChange={e => setCohortFilter(e.target.value)}
											>
												<option value="">All</option>
												{allCohorts.map((c) => {
													return (
														<option key={c.id} value={c.id}>
															{c.name}
														</option>
													);
												})}
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
						<div className="w-full sm:w-auto flex items-center justify-end gap-2 mt-1 sm:mt-0">
							{filteredPeople.length > 0 && (
								<div className="flex items-center gap-2 text-xs text-gray-600">
									<button
										type="button"
										disabled={page === 1}
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
											page === 1
												? "border-gray-200 text-gray-300 cursor-not-allowed"
												: "border-blue-300 text-blue-700 hover:bg-blue-50"
											}`}
									>
										Prev
									</button>
									<button
										type="button"
										disabled={page >= totalPages}
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
											page >= totalPages
												? "border-gray-200 text-gray-300 cursor-not-allowed"
												: "border-blue-300 text-blue-700 hover:bg-blue-50"
											}`}
									>
										Next
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* People Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
					{paginatedPeople.map((person) => {
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
															name={[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
															className="h-full w-full object-cover"
															alt={[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
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
												{[person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")}
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

				{/* Pagination Controls */}
				{filteredPeople.length > 0 && (
					<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
						<span>
							Showing {Math.min((page - 1) * pageSize + 1, filteredPeople.length)}–
							{Math.min(page * pageSize, filteredPeople.length)} of {filteredPeople.length}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={page === 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
									page === 1
										? "border-gray-200 text-gray-300 cursor-not-allowed"
										: "border-blue-300 text-blue-700 hover:bg-blue-50"
								}`}
							>
								Prev
							</button>
							<span className="text-xs text-gray-500">
								Page {page} of {totalPages}
							</span>
							<button
								type="button"
								disabled={page >= totalPages}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
									page >= totalPages
										? "border-gray-200 text-gray-300 cursor-not-allowed"
										: "border-blue-300 text-blue-700 hover:bg-blue-50"
								}`}
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
