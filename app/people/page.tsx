
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
	{ key: "ALL", label: "All", enabled: true },
	{ key: "ALUMNI", label: "Alumni", enabled: true },
	{ key: "STAFF", label: "Staff", enabled: true },
	{ key: "LEADERSHIP", label: "Leadership Team", enabled: false },
];

export default function PeoplePage() {
	const [people, setPeople] = useState<Person[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("ALUMNI");
	const [cohortFilter, setCohortFilter] = useState("");
	const [empStatusFilter, setEmpStatusFilter] = useState("");
	const [nameFilter, setNameFilter] = useState("");
	const [allCohorts, setAllCohorts] = useState<string[]>([]);
	const { data: session } = useSession();
	const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});

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

	// Fetch bookmark state for each person when session is ready
	useEffect(() => {
		if (!session || !session.user) return;
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
	}, [session, people, tab]);

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
									className="appearance-none pl-9 pr-12 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
									value={tab}
									onChange={e => setTab(e.target.value)}
								>
									{TABS.map((t) => (
										<option key={t.key} value={t.key} disabled={!t.enabled}>
											{t.label}
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
						<div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row items-center gap-3">
							{tab === "ALUMNI" && (
								<>
									<label className="mr-2 font-semibold text-purple-700">Cohort</label>
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
									<label className="ml-4 mr-2 font-semibold text-purple-700">Employment</label>
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
								</>
							)}
							<label className="ml-4 mr-2 font-semibold text-purple-700">Name</label>
							<input
								type="text"
								className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
								placeholder="Search by name"
								value={nameFilter}
								onChange={e => setNameFilter(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex-1 flex items-center sm:justify-end justify-center"></div>
				</div>

				{/* People Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
					{filteredPeople.map((person) => {
						const isProfileOwner = session && session.user && session.user.id === person.id;
						const showBookmark = session && session.user && !isProfileOwner;
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
														<Badge className={`mb-2 text-xs font-semibold pointer-events-none
															${person.type === "ALUMNI" ? "bg-red-100 text-red-700" : ""}
															${person.type === "STAFF" ? "bg-blue-100 text-blue-700" : ""}
															${person.type === "LEADERSHIP" ? "bg-yellow-100 text-yellow-800" : ""}
															${person.type === "ADMIN" ? "bg-green-100 text-green-700" : ""}`}> 
															{person.type === "ALUMNI" && <span className="text-base">⭐</span>}
															{person.type === "STAFF" && <span className="text-base">👔</span>}
															{person.type === "LEADERSHIP" && <span className="text-base">👑</span>}
															{person.type === "ADMIN" && <span className="text-base">🛡️</span>}
															{person.type === "ALUMNI" && " Alumni"}
															{person.type === "STAFF" && " Staff"}
															{person.type === "LEADERSHIP" && " Leadership"}
															{person.type === "ADMIN" && " Admin"}
														</Badge>
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
