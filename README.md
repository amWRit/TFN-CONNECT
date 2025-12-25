# TFN-Connect Platform

**LinkedIn for Teach For Nepal Ecosystem** - A comprehensive alumni network, job board, and community platform built with Next.js 15, Prisma, PostgreSQL, and deployed on Vercel.

## 🎯 Platform Purpose

TFN-Connect is an exclusive platform for:
- **Alumni & Fellows**: Update profiles, post career journeys, seek/post jobs
- **LDCs & Staff**: Track fellow development, manage placements, view analytics
- **Recruiters & Schools**: Browse TFN-vetted talent by skills and location
- **Board Members**: View impact dashboards and cohort success metrics

## ✨ Features

### 👥 Alumni Network
- Complete profile timelines with education, experience, and fellowships
- Skill endorsements and badges
- Real-time employment status tracking
- Career journey stories and achievements

### 💼 Job Board
- Post and search education opportunities
- Smart matching based on skills and location
- Application tracking
- 80%+ skills match suggestions

### 📊 Activity Feed
- Career updates from community members
- Job postings and opportunities
- Achievement celebrations
- Community engagement

### 📈 Dashboards
- Cohort success metrics and placement rates
- Alumni impact by region and sector
- Employment status tracking
- Skills distribution analytics

## 🗂️ Database Schema

**17+ Models** including:
- `Person` - Alumni, LDCs, recruiters, schools
- `Fellowship` & `Cohort` - TFN program tracking
- `Experience` & `Education` - Career history
- `Skill` & `ExperienceSkill` - Skills endorsement
- `School` & `LocalGov` - Geographic & institutional data
- `JobPosting` & `JobApplication` - Opportunity board
- `Post` & `Comment` - Activity feed

## 🗃️ Seed Data

The database comes pre-populated with realistic example data:

### Featured Alumni
- **Ramesh Sharma** (Tesro Paaila) - Program Director at Nepal Education Foundation
- **Anjali Poudel** (Tesro Paaila) - Education Specialist, Currently Seeking
- **Pradeep Khatri** (Aatma Paaila) - Principal at Madhav Academy

### Example Organizations
- Shree ABC Secondary School (Dang)
- Shree XYZ Primary School (Dang)
- Madhav Academy (Lumbini)
- Nepal Education Foundation

### Ready-to-View Content
- 3+ complete alumni profiles with timelines
- 3+ active job postings
- 4+ activity feed posts
- Sample skills and endorsements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Setup database
npm run db:push

# Seed with example data
npm run seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see:
- **Home**: Platform overview and featured alumni
- **/alumni**: Browse all network members
- **/alumni/[id]**: View complete profiles with experience timeline
- **/jobs**: Search and browse opportunities
- **/feed**: Activity feed from the community

## 🏗️ Project Structure

```
tfn-connect/
├── app/
│   ├── api/               # API routes (people, jobs, feed, cohorts)
│   ├── alumni/            # Alumni directory & profiles
│   ├── jobs/              # Job board
│   ├── feed/              # Activity feed
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Home page
├── components/
│   ├── ExperienceCard.tsx # Experience timeline component
│   ├── PostCard.tsx       # Activity feed post
│   ├── JobPostingCard.tsx # Job listing
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data script
├── styles/
│   └── globals.css       # Tailwind CSS
└── package.json          # Dependencies

## 📱 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (free tier ready)
- **Styling**: Tailwind CSS with dark mode support
- **Forms**: React Hook Form + Zod validation (ready for forms)

## 🔄 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Sync Prisma schema with database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run seed         # Populate database with seed data
npm run db:reset     # Reset database (⚠️ destructive)
```

## 🌍 Deployment to Vercel

### Free Tier Compatible ✅
- Uses Vercel's free tier ($0/month)
- Server Components & Server Actions optimized
- Edge-runtime compatible
- Serverless functions for API routes

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial TFN-Connect setup"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect GitHub account
   - Select `tfn-connect` repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add `DATABASE_URL` (PostgreSQL connection string)
   - Recommended: Use [Neon](https://neon.tech) free PostgreSQL tier

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Access your app at `your-domain.vercel.app`

## 📊 Example API Endpoints

```bash
# Get all alumni
GET /api/people

# Get specific person with full profile
GET /api/people/:id

# Get all job postings
GET /api/jobs

# Get activity feed
GET /api/feed

# Get cohorts with fellowships
GET /api/cohorts

# Get available skills
GET /api/skills
```

## 🔐 Permissions & Roles

Currently in MVP mode with open read access:
- **Alumni**: Full profile visibility
- **LDCs/Staff**: Cohort and placement data
- **Recruiters**: Browse skills and profiles
- **Public**: Read-only access to profiles and jobs

*Authentication & fine-grained permissions coming in Phase 2*

## 🎨 UI Components Ready

- Profile timeline cards
- Experience history display
- Job posting listings
- Activity feed posts
- Skill badge system
- Status badges (employed, seeking, etc.)
- Navigation with sections

## 🚧 Phase 2 Features (Ready to Implement)

- User authentication & profiles
- Direct messaging between alumni
- Advanced search & filtering
- Job application system
- Recommendation engine
- Analytics dashboards
- Mobile app (React Native)
- Email notifications
- Export to resume/CV
- Integration with LinkedIn

## 📝 Notes

- Seed data includes realistic Nepali names and locations
- All timestamps are properly tracked (createdAt, updatedAt)
- Database supports cascading deletes for data integrity
- Prisma migrations included for easy schema updates
- TypeScript throughout for type safety

## 🤝 Contributing

To add new features:

1. Update `prisma/schema.prisma` if needed
2. Run `npm run db:push` to sync schema
3. Create new API routes in `app/api/`
4. Add UI components in `components/`
5. Create pages in `app/`

## 📞 Support

For issues or questions:
- Check [Next.js docs](https://nextjs.org/docs)
- See [Prisma documentation](https://www.prisma.io/docs/)
- Review [Tailwind CSS guide](https://tailwindcss.com/docs)

---

**Ready to launch!** 🚀 Your TFN-Connect platform is fully configured and ready to view. Start the dev server and explore the alumni network, job board, and activity feed with pre-populated example data.
