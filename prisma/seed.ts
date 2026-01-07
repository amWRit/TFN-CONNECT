// prisma/seed.ts - Complete Teach For Nepal Alumni System Seed
// Run with: npx prisma db seed

import { PrismaClient, PersonType, EduStatus, EmpStatus, SchoolType, JobType, JobStatus, PostType, BookmarkType, OpportunityType, OpportunityStatus, InterestTargetType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // ===== 1. GEOGRAPHY HIERARCHY =====
  console.log('📍 Seeding geography...');
  
  const localGovsData = [
    { name: 'Dang', province: 'Lumbini Province' },
    { name: 'Tanahun', province: 'Gandaki Province' },
    { name: 'Kaski', province: 'Gandaki Province' },
    { name: 'Kathmandu', province: 'Bagmati Province' },
    { name: 'Pokhara', province: 'Gandaki Province' },
    { name: 'Chitwan', province: 'Bagmati Province' },
    { name: 'Jhapa', province: 'Koshi Province' },
    { name: 'Surkhet', province: 'Karnali Province' },
  ];

  await prisma.localGov.createMany({ data: localGovsData, skipDuplicates: true });
  
  const [dang, tanahun, kaski, kathmandu, pokhara, chitwan, jhapa, surkhet] = await prisma.localGov.findMany({
    where: { name: { in: localGovsData.map(lg => lg.name) } },
    orderBy: { name: 'asc' },
  });

  // Schools (mixed types, generic)
  await prisma.school.createMany({
    data: [
      // Dang
      { name: 'Kushmawati Secondary School', localGovId: dang.id, district: 'dang', sector: 'Education', type: SchoolType.SECONDARY },
      { name: 'Shree Ram Secondary School', localGovId: dang.id, district: 'dang', sector: 'Education', type: SchoolType.PRIMARY },
      
      // Tanahun
      { name: 'Pragati Secondary School', localGovId: tanahun.id, district: 'tanahun', sector: 'Education', type: SchoolType.SECONDARY },
      { name: 'Himalaya Basic School', localGovId: tanahun.id, district: 'tanahun', sector: 'Education', type: SchoolType.PRIMARY },
      
      // Kaski/Pokhara
      { name: 'Gyanodaya Secondary School', localGovId: kaski.id, district: 'kaski', sector: 'Education', type: SchoolType.SECONDARY },
      { name: 'Everest Academy', localGovId: pokhara.id, district: 'kaski', type: SchoolType.HIGHER },
      
      // Urban/Tech
      { name: 'Tech Institute', localGovId: kathmandu.id, district: 'kathmandu', type: SchoolType.HIGHER },
      { name: 'Green Valley School', localGovId: chitwan.id, district: 'chitwan', type: SchoolType.PRIMARY },
      { name: 'Community School', localGovId: jhapa.id, district: 'jhapa', type: SchoolType.SECONDARY },
    ],
    skipDuplicates: true,
  });

  const [kushmawati] = await prisma.school.findMany({ where: { name: 'Kushmawati Secondary School' } });
  const [gyanodaya] = await prisma.school.findMany({ where: { name: 'Gyanodaya Secondary School' } });

  // School Groups
  await prisma.schoolGroup.createMany({
    data: [
      { name: 'Dang East Group', localGovId: dang.id },
      { name: 'Tanahun Central Group', localGovId: tanahun.id },
      { name: 'Pokhara Metro Group', localGovId: pokhara.id },
    ],
    skipDuplicates: true,
  });

  const [dangEastGroup] = await prisma.schoolGroup.findMany({ where: { name: 'Dang East Group' } });
  await prisma.schoolGroupSchool.create({
    data: { schoolGroupId: dangEastGroup.id, schoolId: kushmawati.id },
  });

  // ===== 2. PROGRAM STRUCTURE =====
  console.log('🎓 Seeding cohorts...');
  await prisma.cohort.createMany({
    data: [
      { name: 'Tesro Paaila', description: '3rd cohort of TFN fellows', start: new Date('2023-01-01'), end: new Date('2024-01-01') },
      { name: 'Aatma Paaila', description: '2nd cohort of TFN fellows', start: new Date('2022-01-01'), end: new Date('2023-01-01') },
      { name: 'Paaila 1', description: '1st cohort of TFN fellows', start: new Date('2021-01-01'), end: new Date('2022-01-01') },
      { name: 'Leadership Program 2025', description: 'Leadership development cohort' },
      { name: 'Tech Fellowship', description: 'Technology education program' },
      { name: 'Community Impact Cohort', description: 'Social impact initiatives' },
    ],
    skipDuplicates: true,
  });

  const [tesroPaaila] = await prisma.cohort.findMany({ where: { name: 'Tesro Paaila' } });

  // ===== 3. CORE PERSONS (Admin first) =====
  console.log('👥 Seeding persons...');
  const adminPerson = await prisma.person.upsert({
    where: { email1: 'admin@tfn.org.np' },
    update: {},
    create: {
      firstName: 'TFN', lastName: 'Admin', email1: 'admin@tfn.org.np',
      type: PersonType.ADMIN, eduStatus: EduStatus.COMPLETED, empStatus: EmpStatus.EMPLOYED,
    },
  });

  await prisma.person.createMany({
    data: [
      // Alumni
      { firstName: 'Priya', lastName: 'Shrestha', email1: 'priya@tfn.org.np', phone1: '+9779812345671', type: PersonType.ALUMNI, eduStatus: EduStatus.COMPLETED, empStatus: EmpStatus.EMPLOYED },
      { firstName: 'Ramesh', lastName: 'Pradhan', email1: 'ramesh@tfn.org.np', phone1: '+9779812345672', type: PersonType.ALUMNI, eduStatus: EduStatus.COMPLETED, empStatus: EmpStatus.SEEKING },
      { firstName: 'Anil', lastName: 'Thapa', email1: 'anil@tfn.org.np', phone1: '+9779812345673', type: PersonType.ALUMNI, eduStatus: EduStatus.ENROLLED, empStatus: EmpStatus.UNEMPLOYED },
      { firstName: 'Meera', lastName: 'Rana', email1: 'meera@tfn.org.np', linkedin: 'https://linkedin.com/in/meera-rana', type: PersonType.ALUMNI, eduStatus: EduStatus.COMPLETED, empStatus: EmpStatus.SEEKING },
      
      // Staff
      { firstName: 'Sita', lastName: 'Gurung', email1: 'sita@tfn.org.np', type: PersonType.STAFF, eduStatus: EduStatus.COMPLETED, empStatus: EmpStatus.EMPLOYED },
    ],
    skipDuplicates: true,
  });

  const [priya, sitaStaff] = await prisma.person.findMany({
    where: { email1: { in: ['priya@tfn.org.np', 'sita@tfn.org.np'] } },
  });

  // ===== 4. PLACEMENTS =====
  console.log('🏫 Seeding placements...');
  await prisma.placement.createMany({
    data: [
      { name: 'Kushmawati Placement', schoolId: kushmawati.id, schoolGroupId: dangEastGroup.id, managerId: adminPerson.id, fellowCount: 3, subjects: ['Math', 'Science', 'English'] },
      { name: 'Gyanodaya Placement', schoolId: gyanodaya.id, managerId: sitaStaff.id, fellowCount: 2, subjects: ['Science', 'Nepali'] },
    ],
  });

  const [kushmawatiPlacement] = await prisma.placement.findMany({ where: { name: 'Kushmawati Placement' } });

  // ===== 5. FELLOWSHIPS =====
  console.log('📚 Seeding fellowships...');
  await prisma.fellowship.create({
    data: { personId: priya.id, cohortId: tesroPaaila.id, placementId: kushmawatiPlacement.id, subjects: ['Math', 'Science'] },
  });

  // ===== 6. EXPERIENCES & EDUCATION =====
  console.log('💼 Seeding experiences & education...');
  await prisma.experience.createMany({
    data: [
      { personId: priya.id, orgName: 'Kushmawati Secondary School', title: 'Mathematics Teacher', sector: 'Education', type: 'full_time', description: 'Teaching mathematics to grades 9-10', start: new Date('2024-01-01') },
      { personId: sitaStaff.id, orgName: 'Teach For Nepal', title: 'Program Coordinator', sector: 'Non-Profit', type: 'full_time', description: 'Managing fellowship programs', start: new Date('2022-01-01') },
    ],
  });

  await prisma.education.createMany({
    data: [
      { personId: priya.id, institution: 'Tribhuvan University', university: 'Tribhuvan University', level: 'Bachelors', name: 'Bachelor of Education', sector: 'Higher Education', start: new Date('2019-01-01'), end: new Date('2023-01-01') },
    ],
  });

  // ===== 7. SKILLS SYSTEM =====
  console.log('💡 Seeding skills...');
  const skillNames = ['Mathematics Teaching', 'Science Teaching', 'Leadership', 'Project Management', 'Data Analysis', 'Public Speaking', 'Graphic Design', 'Digital Marketing'];
  await prisma.skill.createMany({ data: skillNames.map(name => ({ name, description: `Expertise in ${name.toLowerCase()}` })), skipDuplicates: true });

  const categoryNames = ['Teaching', 'Leadership', 'Technical', 'Soft Skills', 'Creative', 'Business'];
  await prisma.category.createMany({ data: categoryNames.map(name => ({ name })), skipDuplicates: true });

  // ===== 8. DIVERSE JOB POSTINGS =====
  console.log('💼 Seeding jobs...');
  await prisma.jobPosting.createMany({
    data: [
      { title: 'Math Teacher - Kushmawati', overview: 'Full-time mathematics teacher', description: 'Rural secondary school...', sector: 'Education', requiredSkills: [], location: 'Dang', jobType: JobType.FULL_TIME, status: JobStatus.OPEN, deadline: new Date('2026-02-28'), createdById: adminPerson.id },
      { title: 'Software Developer (Full Stack)', overview: 'Build scalable web apps', description: 'React, Node.js, PostgreSQL...', sector: 'Technology', requiredSkills: [], location: 'Kathmandu (Hybrid)', jobType: JobType.HYBRID, status: JobStatus.OPEN, deadline: new Date('2026-03-15'), createdById: adminPerson.id },
      { title: 'Marketing Coordinator', overview: 'Drive digital campaigns', description: 'Social media, content...', sector: 'Marketing', requiredSkills: [], location: 'Pokhara (Remote)', jobType: JobType.REMOTE, status: JobStatus.OPEN, deadline: new Date('2026-02-20'), createdById: sitaStaff.id },
      { title: 'Data Analyst Intern', overview: 'Support research & reporting', description: 'Excel, SQL, Python...', sector: 'Data', requiredSkills: [], location: 'Chitwan', jobType: JobType.INTERNSHIP, status: JobStatus.OPEN, deadline: new Date('2026-02-10'), createdById: sitaStaff.id },
    ],
  });

  // ===== 9. ACTIVITY FEED =====
  console.log('📝 Seeding activity feed...');
  await prisma.post.createMany({
    data: [
      { personId: priya.id, content: 'Excited to join Kushmawati as Math & Science fellow! 🌟 #TFN', postType: PostType.CAREER_UPDATE, likes: 12 },
      { personId: sitaStaff.id, content: "🚀 Leadership Program 2025 applications open! #TFN", postType: PostType.EVENT_ANNOUNCEMENT, likes: 25 },
      { personId: adminPerson.id, content: "New job postings: Software Developer & Marketing roles! Apply now.", postType: PostType.JOB_POSTING, likes: 18 },
    ],
  });

  // ===== 10. OPPORTUNITIES =====
  console.log('🎯 Seeding opportunities...');
  await prisma.opportunity.createMany({
    data: [
      { createdById: adminPerson.id, title: 'Digital Marketing Workshop', overview: '2-day hands-on workshop', description: 'SEO, social media ads...', types: [OpportunityType.TRAINING], location: 'Kathmandu', status: OpportunityStatus.OPEN },
      { createdById: sitaStaff.id, title: 'Startup Accelerator', overview: '6-month program for social enterprises', description: 'Mentorship, funding...', types: [OpportunityType.FUNDING, OpportunityType.ACCELERATORS], location: 'Virtual + Pokhara', status: OpportunityStatus.OPEN },
    ],
  });

  // ===== 11. JOB APPLICATIONS, INTERESTS, BOOKMARKS =====
  console.log('🔗 Seeding relationships...');
  const softwareJob = await prisma.jobPosting.findFirst({ where: { title: 'Software Developer (Full Stack)' } });
  await prisma.jobApplication.create({
    data: { jobPostingId: softwareJob!.id, personId: priya.id, status: 'applied', message: 'Strong full-stack experience!' },
  });

  await prisma.interest.create({
    data: { personId: priya.id, targetType: InterestTargetType.JOB, targetId: softwareJob!.id, message: 'React + Node.js expertise' },
  });

  console.log('✅ Complete seed finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
