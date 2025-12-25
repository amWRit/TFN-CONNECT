// prisma/seed.ts - Comprehensive seed script
import { PrismaClient, PersonType, EduStatus, EmpStatus, SchoolType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===== 1. LOCAL GOVS (2) =====
  const localGovs = await prisma.localGov.createMany({
    data: [
      {
        id: 'lg1',
        name: 'Tanahun',
        province: 'Gandaki'
      },
      {
        id: 'lg2', 
        name: 'Dang',
        province: 'Lumbini'
      }
    ]
  });
  console.log('✅ Created 2 LocalGovs');

  // ===== 2. SCHOOLS (10 across 2 LocalGovs) =====
  const schools = await prisma.school.createMany({
    data: [
      // Tanahun (5 schools)
      { id: 's1', name: 'Kushmawati Secondary School', localGovId: 'lg1', district: 'tanahun', sector: 'Education', type: 'SECONDARY' },
      { id: 's2', name: 'Panchamunidev Secondary School', localGovId: 'lg1', district: 'tanahun', sector: 'Education', type: 'SECONDARY' },
      { id: 's3', name: 'Shree Janakalyaan Secondary School', localGovId: 'lg1', district: 'tanahun', sector: 'Education', type: 'SECONDARY' },
      { id: 's4', name: 'Shree Ratna Secondary School', localGovId: 'lg1', district: 'tanahun', sector: 'Education', type: 'SECONDARY' },
      { id: 's5', name: 'Saraswati Namuna Secondary School', localGovId: 'lg1', district: 'tanahun', sector: 'Education', type: 'SECONDARY' },
      
      // Dang (5 schools)
      { id: 's6', name: 'Ambeshwari Secondary School', localGovId: 'lg2', district: 'dang', sector: 'Education', type: 'SECONDARY' },
      { id: 's7', name: 'Mahakali Secondary School', localGovId: 'lg2', district: 'dang', sector: 'Education', type: 'SECONDARY' },
      { id: 's8', name: 'Janajagriti Secondary School', localGovId: 'lg2', district: 'dang', sector: 'Education', type: 'SECONDARY' },
      { id: 's9', name: 'Nepal Rashtriya Secondary School', localGovId: 'lg2', district: 'dang', sector: 'Education', type: 'SECONDARY' },
      { id: 's10', name: 'Kalika Chetana Secondary School', localGovId: 'lg2', district: 'dang', sector: 'Education', type: 'SECONDARY' }
    ]
  });
  console.log('✅ Created 10 Schools');

  // ===== 3. SCHOOL GROUPS (3) =====
  const schoolGroups = await prisma.schoolGroup.createMany({
    data: [
      { id: 'sg1', name: 'Tanahun East Group', localGovId: 'lg1' },
      { id: 'sg2', name: 'Tanahun West Group', localGovId: 'lg1' },
      { id: 'sg3', name: 'Dang Central Group', localGovId: 'lg2' }
    ]
  });
  console.log('✅ Created 3 SchoolGroups');

  // ===== 4. COHORTS (3) =====
  const cohorts = await prisma.cohort.createMany({
    data: [
      { id: 'c1', name: 'Tesro Paaila', description: '3rd cohort', start: new Date('2023-01-01'), end: new Date('2025-01-01') },
      { id: 'c2', name: 'Aatma Paaila', description: '2nd cohort', start: new Date('2022-01-01'), end: new Date('2024-01-01') },
      { id: 'c3', name: 'Pratham Paaila', description: '1st cohort', start: new Date('2021-01-01'), end: new Date('2023-01-01') }
    ]
  });
  console.log('✅ Created 3 Cohorts');

  // ===== 5. SKILLS (10) =====
  const skills = await prisma.skill.createMany({
    data: [
      { id: 'sk1', name: 'Mathematics', category: 'teaching' },
      { id: 'sk2', name: 'Science', category: 'teaching' },
      { id: 'sk3', name: 'English', category: 'teaching' },
      { id: 'sk4', name: 'Nepali', category: 'teaching' },
      { id: 'sk5', name: 'Social Studies', category: 'teaching' },
      { id: 'sk6', name: 'Leadership', category: 'leadership' },
      { id: 'sk7', name: 'Communication', category: 'personal' },
      { id: 'sk8', name: 'Problem Solving', category: 'personal' },
      { id: 'sk9', name: 'Teamwork', category: 'interpersonal' },
      { id: 'sk10', name: 'Public Speaking', category: 'leadership' }
    ]
  });
  console.log('✅ Created 10 Skills');

  // ===== 6. PLACEMENTS (5 with managers) =====
  const placements = await prisma.placement.createMany({
    data: [
      { id: 'p1', schoolId: 's1', schoolGroupId: 'sg1', managerId: 'p20', fellowCount: 3, subjects: ['Mathematics', 'Science'] },
      { id: 'p2', schoolId: 's3', schoolGroupId: 'sg1', managerId: 'p19', fellowCount: 4, subjects: ['English', 'Social Studies'] },
      { id: 'p3', schoolId: 's6', schoolGroupId: 'sg3', managerId: 'p18', fellowCount: 3, subjects: ['Nepali', 'Mathematics'] },
      { id: 'p4', schoolId: 's8', schoolGroupId: 'sg3', managerId: 'p17', fellowCount: 2, subjects: ['Science', 'English'] },
      { id: 'p5', schoolId: 's10', schoolGroupId: null, managerId: 'p16', fellowCount: 3, subjects: ['Mathematics', 'Social Studies'] }
    ]
  });
  console.log('✅ Created 5 Placements');

  // ===== 7. PERSONS (20: 15 Alumni, 5 Staff) =====
  const personsData = [
    // STAFF (5) - Placement Managers
    { id: 'p16', firstName: 'Ramesh', lastName: 'Prasad', email1: 'ramesh@tfnepal.org', type: 'STAFF', eduStatus: 'COMPLETED', empStatus: 'EMPLOYED' },
    { id: 'p17', firstName: 'Sita', lastName: 'Sharma', email1: 'sita@tfnepal.org', type: 'STAFF', eduStatus: 'COMPLETED', empStatus: 'EMPLOYED' },
    { id: 'p18', firstName: 'Raj', lastName: 'Kumar', email1: 'raj@tfnepal.org', type: 'STAFF', eduStatus: 'COMPLETED', empStatus: 'EMPLOYED' },
    { id: 'p19', firstName: 'Meera', lastName: 'Gurung', email1: 'meera@tfnepal.org', type: 'STAFF', eduStatus: 'COMPLETED', empStatus: 'EMPLOYED' },
    { id: 'p20', firstName: 'Hari', lastName: 'Bahadur', email1: 'hari@tfnepal.org', type: 'STAFF', eduStatus: 'COMPLETED', empStatus: 'EMPLOYED' },
    
    // ALUMNI (15)
    { id: 'p1', firstName: 'Rashmi', lastName: 'Adhikari', email1: 'rashmi.adhikari@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p2', firstName: 'Unnati', lastName: 'Bajracharya', email1: 'unnati.bajracharya@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p3', firstName: 'Anmol', lastName: 'Baral', email1: 'anmol.baral@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p4', firstName: 'Binita', lastName: 'Bhainatwo', email1: 'binita.bhaina@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p5', firstName: 'Sameer', lastName: 'Bhandari', email1: 'sameer.bhandari@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p6', firstName: 'Yojana', lastName: 'Bhusal', email1: 'yojana.bhusal@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p7', firstName: 'Aashu', lastName: 'Chaudhary', email1: 'aashu.chaudhary@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p8', firstName: 'Dipesh', lastName: 'Dahal', email1: 'dipesh.dahal@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p9', firstName: 'Prashant', lastName: 'Deula', email1: 'prashant.deula@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p10', firstName: 'Shubhangee', lastName: 'Gurung', email1: 'shubhangee.gurung@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p11', firstName: 'Nima', lastName: 'Gurung', email1: 'nima.gurung@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p12', firstName: 'Kishore', lastName: 'Karki', email1: 'kishore.karki@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p13', firstName: 'Sangita', lastName: 'Kattel', email1: 'sangita.kattel@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p14', firstName: 'Prabina', lastName: 'Khatri', email1: 'prabina.khatri@alumni.tfnepal.org', type: 'ALUMNI' },
    { id: 'p15', firstName: 'Anjani', lastName: 'Kumari', email1: 'anjani.kumari@alumni.tfnepal.org', type: 'ALUMNI' }
  ];

  await prisma.person.createMany({
    data: personsData.map(p => ({
      ...p,
      eduStatus: p.type === 'ALUMNI' ? 'COMPLETED' : 'COMPLETED',
      empStatus: p.type === 'ALUMNI' ? 'SEEKING' : 'EMPLOYED'
    }))
  });
  console.log('✅ Created 20 Persons (15 Alumni, 5 Staff)');

  // ===== 8. FELLOWSHIPS (15 linking Alumni → Cohorts → Placements) =====
  const fellowships = [];
  for (let i = 1; i <= 15; i++) {
    fellowships.push({
      id: `f${i}`,
      personId: `p${i}`,
      cohortId: `c${(i % 3) + 1}`,
      placementId: `p${Math.floor((i-1)/3) + 1}`,
      subjects: ['Mathematics', 'Science', 'English'][Math.floor(Math.random() * 3)]
    });
  }

  await prisma.fellowship.createMany({ data: fellowships });
  console.log('✅ Created 15 Fellowships');

  // ===== 9. EXPERIENCES (Sample for first 5 persons) =====
  await prisma.experience.createMany({
    data: [
      { id: 'e1', personId: 'p1', orgName: 'Teach For Nepal', title: 'Fellow', sector: 'Education', type: 'full_time', start: new Date('2024-01-01') },
      { id: 'e2', personId: 'p2', orgName: 'Kushmawati School', title: 'Teacher', sector: 'Education', type: 'contract', start: new Date('2024-06-01') },
      { id: 'e3', personId: 'p3', orgName: 'TFN Alumni Network', title: 'Mentor', sector: 'Education', type: 'part_time', start: new Date('2025-01-01') },
      { id: 'e4', personId: 'p16', orgName: 'Teach For Nepal', title: 'Placement Manager', sector: 'Education', type: 'full_time', start: new Date('2022-01-01') },
      { id: 'e5', personId: 'p17', orgName: 'Dang Education Dept', title: 'Coordinator', sector: 'Education', type: 'full_time', start: new Date('2021-01-01') }
    ]
  });
  console.log('✅ Created 5 Experiences');

  // ===== 10. EDUCATION (Sample for first 5 persons) =====
  await prisma.education.createMany({
    data: [
      { id: 'ed1', personId: 'p1', institution: 'Tribhuvan University', level: 'Bachelors', name: 'B.Ed', start: new Date('2020-01-01'), end: new Date('2024-01-01') },
      { id: 'ed2', personId: 'p2', institution: 'Tribhuvan University', level: 'Bachelors', name: 'B.Sc', start: new Date('2019-01-01'), end: new Date('2023-01-01') },
      { id: 'ed3', personId: 'p3', institution: 'Kathmandu University', level: 'Bachelors', name: 'B.A.', start: new Date('2020-01-01'), end: new Date('2024-01-01') },
      { id: 'ed4', personId: 'p16', institution: 'Tribhuvan University', level: 'Masters', name: 'M.Ed', start: new Date('2018-01-01'), end: new Date('2020-01-01') },
      { id: 'ed5', personId: 'p17', institution: 'Purbanchal University', level: 'Bachelors', name: 'B.Ed', start: new Date('2016-01-01'), end: new Date('2020-01-01') }
    ]
  });
  console.log('✅ Created 5 Educations');

  // Update placement fellow counts
  await prisma.placement.updateMany({
    where: { id: { in: ['p1', 'p2', 'p3', 'p4', 'p5'] } },
    data: { fellowCount: 3 }
  });

  console.log('🎉 Seed complete! Database fully populated with relations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
