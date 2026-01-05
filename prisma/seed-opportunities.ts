// prisma/seed-opportunities.ts - Seed only opportunities
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding opportunities...');
  await prisma.opportunity.deleteMany({});
  await prisma.opportunity.createMany({
    data: [
      {
        id: 'o1',
        createdById: 'p10',
        title: 'Mentorship Program',
        description: 'Join our mentorship program to guide new fellows and alumni.',
        types: ['MENTORSHIP', 'EDUCATION'],
        location: 'Kathmandu',
        status: 'OPEN'
      },
      {
        id: 'o2',
        createdById: 'p11',
        title: 'Research Grant',
        description: 'Apply for a research grant in education innovation.',
        types: ['GRANTS', 'EDUCATION'],
        location: 'Lalitpur',
        status: 'OPEN'
      },
      {
        id: 'o3',
        createdById: 'p12',
        title: 'Fellowship 2026',
        description: 'Participate in our 2026 fellowship for professional growth.',
        types: ['FELLOWSHIPS', 'TRAINING'],
        location: 'Pokhara',
        status: 'OPEN'
      },
      {
        id: 'o4',
        createdById: 'p13',
        title: 'Internship Opportunity',
        description: 'Paid internship for students interested in teaching.',
        types: ['INTERNSHIPS', 'EDUCATION'],
        location: 'Biratnagar',
        status: 'OPEN'
      },
      {
        id: 'o5',
        createdById: 'p14',
        title: 'Volunteering for Summer Camp',
        description: 'Volunteer to support our summer camp for underprivileged children.',
        types: ['VOLUNTEERING', 'EVENTS'],
        location: 'Chitwan',
        status: 'OPEN'
      }
    ]
  });
  console.log('✅ Seeded opportunities');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
