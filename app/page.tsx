import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="w-full bg-gray-50">
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
            <Link href="/alumni">
              <Button variant="secondary" className="w-full sm:w-auto px-4 py-2">
                👥 Explore Alumni
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" className="w-full sm:w-auto px-4 py-2">
                💼 Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-blue-400 hover:shadow-lg hover:border-blue-500 transition duration-300 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">👥</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Network</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              Connect with 1000+ TFN alumni, LDCs, and education professionals across Nepal.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 border-green-400 hover:shadow-lg hover:border-green-500 transition duration-300 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">💼</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Jobs</h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              Find and post education-focused opportunities. Connect with vetted TFN talent.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border-2 border-blue-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">8</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Active Alumni</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border-2 border-green-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">7</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Job Postings</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl border-2 border-purple-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">14</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Community Posts</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl border-2 border-orange-500 text-center hover:shadow-md transition">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">2</div>
              <p className="text-gray-700 mt-1 text-xs sm:text-sm font-medium">Active Cohorts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
