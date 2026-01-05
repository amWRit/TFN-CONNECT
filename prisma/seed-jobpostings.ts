// prisma/seed-jobpostings.ts - Seed only job postings
import { PrismaClient, JobType, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding job postings...');
  await prisma.jobPosting.deleteMany({});

  // Fetch all skills to map names to IDs
  const allSkills = await prisma.skill.findMany();
  const skillNameToId: { [key: string]: string } = {};
  allSkills.forEach(skill => {
    skillNameToId[skill.name] = skill.id;
  });

  // Use only the provided skill IDs in requiredSkills arrays
  const jobPostingsData = [
    {
      id: 'j1',
      createdById: 'p16',
      title: 'Mathematics Teacher',
      description: 'Seeking experienced mathematics teacher for secondary level. Strong knowledge of curriculum and innovative teaching methods required.',
      sector: 'Education',
      requiredSkills: ['cmjr4wt8x0000pqb636o65be6', 'sk10', 'sk3'],
      location: 'Tanahun',
      jobType: JobType.FULL_TIME,
      status: JobStatus.OPEN
    },
    {
      id: 'j2',
      createdById: 'p17',
      title: 'Science Teacher',
      description: 'Full-time science teacher position for grades 8-10. Experience with lab-based learning preferred.',
      sector: 'Education',
      requiredSkills: ['sk7', 'sk8', 'sk9'],
      location: 'Tanahun',
      jobType: JobType.FULL_TIME,
      status: JobStatus.OPEN
    },
    {
      id: 'j3',
      createdById: 'p18',
      title: 'English Language Teacher',
      description: 'Passionate English teacher needed to develop communication skills in students. Part-time position available.',
      sector: 'Education',
      requiredSkills: ['sk10', 'sk3', 'sk7'],
      location: 'Dang',
      jobType: JobType.PART_TIME,
      status: JobStatus.OPEN
    },
    {
      id: 'j4',
      createdById: 'p19',
      title: 'Social Studies Teacher',
      description: 'Educator needed to teach history, geography, and civics. Must be creative in engaging students.',
      sector: 'Education',
      requiredSkills: ['sk8', 'sk9', 'cmjr4wt8x0000pqb636o65be6'],
      location: 'Dang',
      jobType: JobType.FULL_TIME,
      status: JobStatus.OPEN
    },
    {
      id: 'j5',
      createdById: 'p20',
      title: 'Physics Teacher',
      description: 'Experienced physics teacher to conduct practical demonstrations and theory classes for advanced learners.',
      sector: 'Education',
      requiredSkills: ['sk3', 'sk7', 'sk9'],
      location: 'Dang',
      jobType: JobType.CONTRACT,
      status: JobStatus.OPEN
    }
  ];

  for (const job of jobPostingsData) {
    await prisma.jobPosting.create({ data: job });
  }
  console.log('✅ Seeded job postings');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
