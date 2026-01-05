// prisma/seed-jobpostings.ts - Seed only job postings
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding job postings...');
  await prisma.jobPosting.deleteMany({});
  await prisma.jobPosting.createMany({
    data: [
      {
        id: 'j1',
        createdById: 'p16',
        title: 'Mathematics Teacher',
        description: 'Seeking experienced mathematics teacher for secondary level. Strong knowledge of curriculum and innovative teaching methods required.',
        sector: 'Education',
        requiredSkills: JSON.stringify(['Mathematics', 'Curriculum Design', 'Student Management']),
        location: 'Tanahun',
        jobType: 'FULL_TIME',
        status: 'OPEN'
      },
      {
        id: 'j2',
        createdById: 'p17',
        title: 'Science Teacher',
        description: 'Full-time science teacher position for grades 8-10. Experience with lab-based learning preferred.',
        sector: 'Education',
        requiredSkills: JSON.stringify(['Science', 'Lab Management', 'Problem Solving']),
        location: 'Tanahun',
        jobType: 'FULL_TIME',
        status: 'OPEN'
      },
      {
        id: 'j3',
        createdById: 'p18',
        title: 'English Language Teacher',
        description: 'Passionate English teacher needed to develop communication skills in students. Part-time position available.',
        sector: 'Education',
        requiredSkills: JSON.stringify(['English', 'Communication', 'Literature']),
        location: 'Dang',
        jobType: 'PART_TIME',
        status: 'OPEN'
      },
      {
        id: 'j4',
        createdById: 'p19',
        title: 'Social Studies Teacher',
        description: 'Educator needed to teach history, geography, and civics. Must be creative in engaging students.',
        sector: 'Education',
        requiredSkills: JSON.stringify(['History', 'Geography', 'Civic Education']),
        location: 'Dang',
        jobType: 'FULL_TIME',
        status: 'OPEN'
      },
      {
        id: 'j5',
        createdById: 'p20',
        title: 'Physics Teacher',
        description: 'Experienced physics teacher to conduct practical demonstrations and theory classes for advanced learners.',
        sector: 'Education',
        requiredSkills: JSON.stringify(['Physics', 'Laboratory Skills', 'Numeracy']),
        location: 'Dang',
        jobType: 'CONTRACT',
        status: 'OPEN'
      }
    ]
  });
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
