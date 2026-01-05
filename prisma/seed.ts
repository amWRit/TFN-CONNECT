// prisma/seed.ts - Comprehensive seed script
import { PrismaClient, PersonType, EduStatus, EmpStatus, SchoolType } from '@prisma/client';

import { JobType, JobStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data (reverse order of dependencies)
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.jobApplication.deleteMany({});
  await prisma.jobPosting.deleteMany({});
  await prisma.fellowship.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.experienceSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.placement.deleteMany({});
  await prisma.cohort.deleteMany({});
  await prisma.schoolGroupSchool.deleteMany({});
  await prisma.schoolGroup.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.localGov.deleteMany({});
  console.log('🗑️  Cleaned up existing data');

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
      { id: 'sk1', name: 'Mathematics' },
      { id: 'sk2', name: 'Science' },
      { id: 'sk3', name: 'English' },
      { id: 'sk4', name: 'Nepali' },
      { id: 'sk5', name: 'Social Studies' },
      { id: 'sk6', name: 'Leadership' },
      { id: 'sk7', name: 'Communication' },
      { id: 'sk8', name: 'Problem Solving' },
      { id: 'sk9', name: 'Teamwork' },
      { id: 'sk10', name: 'Public Speaking' }
    ]
  });
  console.log('✅ Created 10 Skills');

  // ===== 6. PERSONS (20: 15 Alumni, 5 Staff) - CREATE BEFORE PLACEMENTS =====
  const personsData = [
    // STAFF (5) - Placement Managers
    { id: 'p16', firstName: 'Ramesh', lastName: 'Prasad', email1: 'ramesh@tfnepal.org', type: 'STAFF', phone1: '9841234567', bio: 'Passionate education leader with 8+ years in school management and teacher development. Committed to improving quality education in rural Nepal.' },
    { id: 'p17', firstName: 'Sita', lastName: 'Sharma', email1: 'sita@tfnepal.org', type: 'STAFF', phone1: '9842234567', bio: 'Experienced coordinator focusing on curriculum design and student assessment. Dedicated to empowering students through innovative teaching methods.' },
    { id: 'p18', firstName: 'Raj', lastName: 'Kumar', email1: 'raj@tfnepal.org', type: 'STAFF', phone1: '9843234567', bio: 'Education specialist with expertise in teacher training and institutional development. Working to bridge the gap between urban and rural education.' },
    { id: 'p19', firstName: 'Meera', lastName: 'Gurung', email1: 'meera@tfnepal.org', type: 'STAFF', phone1: '9844234567', bio: 'Program manager passionate about fostering community engagement in schools. Believes in the transformative power of quality education.' },
    { id: 'p20', firstName: 'Hari', lastName: 'Bahadur', email1: 'hari@tfnepal.org', type: 'STAFF', phone1: '9845234567', bio: 'Strategic thinker focused on scaling educational initiatives across districts. Advocate for equitable access to quality education for all.' },
    
    // ALUMNI (15)
    { id: 'p1', firstName: 'Rashmi', lastName: 'Adhikari', email1: 'rashmi.adhikari@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9846234567', bio: 'Mathematics teacher with passion for making complex concepts simple. Actively mentoring young teachers and contributing to curriculum improvement.' },
    { id: 'p2', firstName: 'Unnati', lastName: 'Bajracharya', email1: 'unnati.bajracharya@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9847234567', bio: 'Science educator committed to hands-on learning. Exploring innovative teaching techniques and working towards gender equality in education.' },
    { id: 'p3', firstName: 'Anmol', lastName: 'Baral', email1: 'anmol.baral@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9848234567', bio: 'English language specialist focused on developing communication skills. Interested in literature and fostering a love for reading among students.' },
    { id: 'p4', firstName: 'Binita', lastName: 'Bhaina', email1: 'binita.bhaina@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9849234567', bio: 'Social studies educator dedicated to historical awareness and civic education. Passionate about developing critical thinking in young minds.' },
    { id: 'p5', firstName: 'Sameer', lastName: 'Bhandari', email1: 'sameer.bhandari@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9850234567', bio: 'Mathematics and physics teacher with interest in educational technology. Exploring ways to make STEM education accessible and engaging.' },
    { id: 'p6', firstName: 'Yojana', lastName: 'Bhusal', email1: 'yojana.bhusal@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9851234567', bio: 'Primary education specialist working on foundational literacy and numeracy. Believes early intervention is key to educational success.' },
    { id: 'p7', firstName: 'Aashu', lastName: 'Chaudhary', email1: 'aashu.chaudhary@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9852234567', bio: 'Teacher advocate focused on school leadership and institutional development. Working to create supportive learning environments for all students.' },
    { id: 'p8', firstName: 'Dipesh', lastName: 'Dahal', email1: 'dipesh.dahal@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9853234567', bio: 'English and Nepali language educator with focus on cultural preservation. Passionate about connecting students with their heritage through literature.' },
    { id: 'p9', firstName: 'Prashant', lastName: 'Deula', email1: 'prashant.deula@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9854234567', bio: 'Science teacher interested in environmental education and sustainability. Committed to inspiring the next generation of scientific thinkers.' },
    { id: 'p10', firstName: 'Shubhangee', lastName: 'Gurung', email1: 'shubhangee.gurung@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9855234567', bio: 'Mathematics educator with focus on problem-solving and analytical skills. Mentoring other teachers to improve pedagogical practices.' },
    { id: 'p11', firstName: 'Nima', lastName: 'Gurung', email1: 'nima.gurung@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9856234567', bio: 'Biology and health educator passionate about wellness and nutrition awareness. Working to promote holistic development of students.' },
    { id: 'p12', firstName: 'Kishore', lastName: 'Karki', email1: 'kishore.karki@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9857234567', bio: 'Physics teacher with interest in practical applications of science. Engaged in educational research and professional development activities.' },
    { id: 'p13', firstName: 'Sangita', lastName: 'Kattel', email1: 'sangita.kattel@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9858234567', bio: 'Social sciences educator focused on citizenship and social responsibility. Actively involved in community engagement initiatives through schools.' },
    { id: 'p14', firstName: 'Prabina', lastName: 'Khatri', email1: 'prabina.khatri@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9859234567', bio: 'Mathematics and ICT teacher exploring technology integration in classrooms. Passionate about bridging the digital divide in rural education.' },
    { id: 'p15', firstName: 'Anjani', lastName: 'Kumari', email1: 'anjani.kumari@alumni.tfnepal.org', type: 'ALUMNI', phone1: '9860234567', bio: 'Language and literature educator with focus on inclusive education. Working to ensure all students have equal access to quality learning.' }
  ];

  await prisma.person.createMany({
    data: personsData.map(p => ({
      ...p,
      type: p.type as PersonType,
      eduStatus: p.type === 'ALUMNI' ? EduStatus.COMPLETED : EduStatus.COMPLETED,
      empStatus: p.type === 'ALUMNI' ? EmpStatus.SEEKING : EmpStatus.EMPLOYED
    }))
  });

  // ===== 7. PLACEMENTS (5 with managers) =====
  const placements = await prisma.placement.createMany({
    data: [
      { id: 'p1', name: 'Kushmawati Secondary School', schoolId: 's1', schoolGroupId: 'sg1', managerId: 'p20', fellowCount: 3, subjects: ['Mathematics', 'Science'] },
      { id: 'p2', name: 'Shree Janakalyaan Secondary School', schoolId: 's3', schoolGroupId: 'sg1', managerId: 'p19', fellowCount: 4, subjects: ['English', 'Social Studies'] },
      { id: 'p3', name: 'Ambeshwari Secondary School', schoolId: 's6', schoolGroupId: 'sg3', managerId: 'p18', fellowCount: 3, subjects: ['Nepali', 'Mathematics'] },
      { id: 'p4', name: 'Janajagriti Secondary School', schoolId: 's8', schoolGroupId: 'sg3', managerId: 'p17', fellowCount: 2, subjects: ['Science', 'English'] },
      { id: 'p5', name: 'Kalika Chetana Secondary School', schoolId: 's10', schoolGroupId: null, managerId: 'p16', fellowCount: 3, subjects: ['Mathematics', 'Social Studies'] }
    ]
  });
  console.log('✅ Created 5 Placements');

  // ===== 8. FELLOWSHIPS (15 linking Alumni → Cohorts → Placements) =====
  const fellowships = [];
  const subjectOptions = [
    ['Mathematics'],
    ['Science'],
    ['English'],
    ['Mathematics', 'Science'],
    ['English', 'Social Studies']
  ];
  for (let i = 1; i <= 15; i++) {
    fellowships.push({
      id: `f${i}`,
      personId: `p${i}`,
      cohortId: `c${(i % 3) + 1}`,
      placementId: `p${Math.floor((i-1)/3) + 1}`,
      subjects: subjectOptions[Math.floor(Math.random() * subjectOptions.length)]
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

  // ===== 10. JOB POSTINGS (5) =====
  // Fetch all skills to map names to IDs
  const allSkills = await prisma.skill.findMany();
  const skillNameToId: { [key: string]: string } = {};
  allSkills.forEach(skill => {
    skillNameToId[skill.name] = skill.id;
  });

  const jobPostingsData = [
    {
      id: 'j1',
      createdById: 'p16',
      title: 'Mathematics Teacher',
      description: 'Seeking experienced mathematics teacher for secondary level. Strong knowledge of curriculum and innovative teaching methods required.',
      sector: 'Education',
      requiredSkills: [
        skillNameToId['Mathematics'],
        skillNameToId['Leadership'] || 'sk6',
        skillNameToId['Communication'] || 'sk7'
      ].filter(Boolean),
      location: 'Tanahun',
      jobType: JobType.FULL_TIME, // enum value
      status: JobStatus.OPEN // enum value
    },
    {
      id: 'j2',
      createdById: 'p17',
      title: 'Science Teacher',
      description: 'Full-time science teacher position for grades 8-10. Experience with lab-based learning preferred.',
      sector: 'Education',
      requiredSkills: [
        skillNameToId['Science'],
        skillNameToId['Problem Solving'] || 'sk8',
        skillNameToId['Teamwork'] || 'sk9'
      ].filter(Boolean),
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
      requiredSkills: [
        skillNameToId['English'],
        skillNameToId['Communication'] || 'sk7',
        skillNameToId['Public Speaking'] || 'sk10'
      ].filter(Boolean),
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
      requiredSkills: [
        skillNameToId['Social Studies'],
        skillNameToId['Leadership'] || 'sk6',
        skillNameToId['Teamwork'] || 'sk9'
      ].filter(Boolean),
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
      requiredSkills: [
        skillNameToId['Science'],
        skillNameToId['Mathematics'],
        skillNameToId['Problem Solving'] || 'sk8'
      ].filter(Boolean),
      location: 'Dang',
      jobType: JobType.CONTRACT,
      status: JobStatus.OPEN
    }
  ];

  await prisma.jobPosting.createMany({ data: jobPostingsData });
  console.log('✅ Created 5 Job Postings');

  // ===== 11. JOB APPLICATIONS (8) =====
  await prisma.jobApplication.createMany({
    data: [
      { id: 'ja1', jobPostingId: 'j1', personId: 'p1', status: 'applied', message: 'Interested in teaching mathematics with innovative approaches' },
      { id: 'ja2', jobPostingId: 'j1', personId: 'p2', status: 'reviewed', message: 'Mathematics specialist with 2 years experience' },
      { id: 'ja3', jobPostingId: 'j2', personId: 'p3', status: 'applied', message: 'Science educator looking for full-time position' },
      { id: 'ja4', jobPostingId: 'j3', personId: 'p4', status: 'applied', message: 'English teacher with passion for literature' },
      { id: 'ja5', jobPostingId: 'j3', personId: 'p5', status: 'accepted', message: 'Ready to start immediately' },
      { id: 'ja6', jobPostingId: 'j4', personId: 'p6', status: 'applied', message: 'Social studies teacher seeking full-time role' },
      { id: 'ja7', jobPostingId: 'j5', personId: 'p7', status: 'reviewed', message: 'Physics teacher with strong practical skills' },
      { id: 'ja8', jobPostingId: 'j5', personId: 'p8', status: 'applied', message: 'Experienced in physics laboratory management' }
    ]
  });
  console.log('✅ Created 8 Job Applications');

  // ===== 12. POSTS (10 for activity feed) =====
  await prisma.post.createMany({
    data: [
      {
        id: 'po1',
        personId: 'p1',
        content: 'Just completed my first year of teaching! Excited to share my journey with the TFN community.',
        postType: 'career_update',
        likes: 5
      },
      {
        id: 'po2',
        personId: 'p2',
        content: 'Thrilled to announce that I got promoted to Head of Mathematics Department at my school!',
        postType: 'achievement',
        likes: 12
      },
      {
        id: 'po3',
        personId: 'p3',
        content: 'Kushmawati Secondary School is hiring! Check our jobs page for open positions.',
        postType: 'job_posting',
        likes: 8
      },
      {
        id: 'po4',
        personId: 'p4',
        content: 'Teaching is not just a job, it\'s a passion. Love working with my students every day!',
        postType: 'general',
        likes: 7
      },
      {
        id: 'po5',
        personId: 'p5',
        content: 'Successfully implemented a new science curriculum at my school. Results are amazing!',
        postType: 'achievement',
        likes: 15
      },
      {
        id: 'po6',
        personId: 'p6',
        content: 'Exploring new pedagogical techniques in the classroom. Innovation in education is key!',
        postType: 'career_update',
        likes: 9
      },
      {
        id: 'po7',
        personId: 'p7',
        content: 'Grateful for my TFN fellowship experience. It shaped my teaching philosophy!',
        postType: 'general',
        likes: 6
      },
      {
        id: 'po8',
        personId: 'p8',
        content: 'Transitioning to educational leadership. New chapter begins!',
        postType: 'career_update',
        likes: 11
      },
      {
        id: 'po9',
        personId: 'p16',
        content: 'Proud of our school\'s improvements in student engagement metrics this year.',
        postType: 'achievement',
        likes: 10
      },
      {
        id: 'po10',
        personId: 'p17',
        content: 'Mentoring the next generation of teachers. The impact of TFN continues to grow!',
        postType: 'general',
        likes: 14
      }
    ]
  });
  console.log('✅ Created 10 Posts');

  // ===== 13. COMMENTS (12) =====
  await prisma.comment.createMany({
    data: [
      { id: 'c1', postId: 'po1', personId: 'p2', content: 'Congratulations! Your enthusiasm is contagious.' },
      { id: 'c2', postId: 'po1', personId: 'p5', content: 'Keep up the great work!' },
      { id: 'c3', postId: 'po2', personId: 'p1', content: 'That\'s amazing news! Well deserved.' },
      { id: 'c4', postId: 'po2', personId: 'p3', content: 'Proud of you! Your hard work paid off.' },
      { id: 'c5', postId: 'po5', personId: 'p2', content: 'Would love to learn more about your curriculum approach!' },
      { id: 'c6', postId: 'po5', personId: 'p6', content: 'Innovation like this is what education needs.' },
      { id: 'c7', postId: 'po8', personId: 'p1', content: 'Exciting transition! Best of luck.' },
      { id: 'c8', postId: 'po9', personId: 'p4', content: 'Your leadership is making a real difference.' },
      { id: 'c9', postId: 'po10', personId: 'p3', content: 'The ripple effect of great teaching!' },
      { id: 'c10', postId: 'po10', personId: 'p7', content: 'This is what it\'s all about.' },
      { id: 'c11', postId: 'po3', personId: 'p6', content: 'Shared this with interested candidates!' },
      { id: 'c12', postId: 'po4', personId: 'p8', content: 'Your passion inspires us all.' }
    ]
  });
  console.log('✅ Created 12 Comments');

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
