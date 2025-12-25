import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to TFN-Connect</h1>
          <p className="text-xl mb-8">
            LinkedIn for the Teach For Nepal Ecosystem
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Connect with TFN alumni, find opportunities, share your career journey, and discover the impact of our network.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/alumni">
              <Button size="lg" variant="secondary">
                Explore Alumni
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="secondary">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h3 className="text-2xl font-bold mb-4">👥 Network</h3>
          <p className="text-gray-600">
            Connect with 1000+ TFN alumni, LDCs, and education professionals across Nepal.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h3 className="text-2xl font-bold mb-4">💼 Jobs</h3>
          <p className="text-gray-600">
            Find and post education-focused opportunities. Connect with vetted TFN talent.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h3 className="text-2xl font-bold mb-4">📊 Impact</h3>
          <p className="text-gray-600">
            Track cohort success, alumni placements, and the collective impact of our network.
          </p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-3xl font-bold mb-8">Featured Alumni</h2>
        <p className="text-gray-600 mb-6">
          Start by exploring profiles of our network members below:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/alumni/ramesh">
            <div className="p-6 border rounded-lg hover:shadow-lg transition cursor-pointer">
              <h3 className="font-bold text-lg">Ramesh Sharma</h3>
              <p className="text-sm text-gray-600">Program Director at Nepal Education Foundation</p>
              <p className="text-xs text-gray-500 mt-2">Tesro Paaila · Leadership, Teaching</p>
            </div>
          </Link>
          <Link href="/alumni/anjali">
            <div className="p-6 border rounded-lg hover:shadow-lg transition cursor-pointer">
              <h3 className="font-bold text-lg">Anjali Poudel</h3>
              <p className="text-sm text-gray-600">Education Specialist | Seeking Opportunities</p>
              <p className="text-xs text-gray-500 mt-2">Tesro Paaila · Curriculum Design, Teaching</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
