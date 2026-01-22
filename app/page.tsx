import { Button } from "@/components/ui/button"
import { MessageSquareHeart } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { PersonType } from "@prisma/client"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // if (session) {
  //   redirect("/feed")
  // }

  // Live stats from the database
  const now = new Date()
  const [alumniCount, activeCohortCount, totalJobCount, openJobCount, totalOpportunityCount, openOpportunityCount, totalEventCount, upcomingEventsCount, postCount] = await Promise.all([
    // Alumni & Fellows
    prisma.person.count({
      where: {
        type: {
          in: [PersonType.ALUMNI, PersonType.STAFF_ALUMNI, PersonType.FELLOW],
        },
      },
    }),
    // Active Cohorts
    prisma.cohort.count({
      where: {
        OR: [{ end: null }, { end: { gte: now } }],
      },
    }),
    // Total Jobs
    prisma.jobPosting.count(),
    // Open Jobs
    prisma.jobPosting.count({
      where: { status: "OPEN" },
    }),
    // Total Opportunities
    prisma.opportunity.count(),
    // Open Opportunities
    prisma.opportunity.count({
      where: { status: "OPEN" },
    }),
    // Total Events
    prisma.event.count(),
    // Upcoming Events
    prisma.event.count({
      where: {
        startDateTime: {
          gte: now,
        },
      },
    }),
    // Community Posts
    prisma.post.count(),
  ])

  return (
    <div className="w-full bg-gray-50 pb-[88px] sm:pb-6 md:pb-8 lg:pb-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-6 sm:py-8 md:py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">Welcome to TFN-Connect</h1>
          <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-blue-100">
            Empowering the Teach For Nepal Ecosystem
          </p>
          <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-6 max-w-3xl mx-auto text-blue-50 leading-relaxed">
            Connect with TFN alumni, find opportunities, share your career journey, and discover the impact of our network.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link href="/people">
              <Button variant="secondary" className="w-full sm:w-auto px-4 py-2">
                🌐 Explore TFN Community
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" className="w-full sm:w-auto px-4 py-2">
                💼 Browse Jobs
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="secondary" className="w-full sm:w-auto px-4 py-2">
                🚀 Browse Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-blue-400 hover:shadow-lg hover:border-blue-500 transition duration-300 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">🤝</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Network</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              Connect with TFN alumni, staff and leadership team. Share your career journey, celebrate achievements and post updates, milestones, 
              and stories to your community feed.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-green-400 hover:shadow-lg hover:border-green-500 transition duration-300 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">💼</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Jobs and Opportunities</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              Discover and share mission-driven roles and opportunities, and connect with trusted TFN talent ready to lead change.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-purple-400 hover:shadow-lg hover:border-purple-500 transition duration-300 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">📊</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Impact</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              Track cohort success, alumni placements, and the collective impact of our network.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-3 sm:py-4 md:py-6 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-900">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border-2 border-blue-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{alumniCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Alumni & Fellows in the network</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl border-2 border-orange-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{activeCohortCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Active cohorts</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border-2 border-green-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalJobCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Total jobs</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 sm:p-6 rounded-xl border-2 border-green-600 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-green-700">{openJobCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Open jobs</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-6 rounded-xl border-2 border-emerald-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{totalOpportunityCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Total opportunities</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 sm:p-6 rounded-xl border-2 border-emerald-600 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{openOpportunityCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Open opportunities</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 sm:p-6 rounded-xl border-2 border-pink-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-pink-600">{totalEventCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Total events</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 sm:p-6 rounded-xl border-2 border-pink-600 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-pink-700">{upcomingEventsCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Upcoming events</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl border-2 border-purple-500 text-center hover:shadow-md transition flex flex-col items-center justify-center">
              <MessageSquareHeart className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-1" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{postCount}</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Community posts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-4 sm:py-6 md:py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-center text-gray-900">
            What you can do in TFN-Connect
          </h2>
          <p className="text-[11px] sm:text-sm text-gray-600 text-center mb-4 sm:mb-6 max-w-3xl mx-auto">
            A quick tour of the things alumni, staff, and partners do every day in TFN-Connect.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-1 flex items-center gap-2">
                <span className="text-lg">💼</span>
                <span>Post and discover jobs</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Post openings for alumni and browse roles by type, status, and required skills – from full-time leadership positions to short-term projects.
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-green-800 mb-1 flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span>Share and explore opportunities</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Highlight fellowships, grants, trainings, and events, and find the opportunities that match where you want to grow next.
              </p>
            </div>

            <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-purple-800 mb-1 flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span>Post to your community feed</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Share wins, reflections, new roles, or big questions as posts, and keep the conversation going with likes, comments, and edits.
              </p>
            </div>

            <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                <span className="text-lg">🔖</span>
                <span>Bookmark people, jobs, posts, and opportunities</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Save profiles, roles, opportunities, and posts you don&apos;t want to lose – and revisit them anytime from your bookmarks page.
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-red-800 mb-1 flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <span>Mark jobs and opportunities as interested</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Keep a focused short-list of roles and opportunities you&apos;re curious about, and let the people who posted them know you&apos;re interested – separate from general bookmarks, so you can follow up later.
              </p>
            </div>

            <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm hover:shadow-md transition group">
              <h3 className="text-sm sm:text-base font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                <span className="text-lg">📈</span>
                <span>Review your activity in one place</span>
              </h3>
              <p className="text-gray-700 text-[11px] sm:text-sm leading-relaxed">
                Visit your activity page to see the jobs and opportunities you created, posts you shared, and everything you bookmarked or marked as interested.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
