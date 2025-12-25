import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Test connection
    await (prisma as any).$queryRaw`SELECT 1`;
    console.log("✓ Database connected\n");

    // ===== Skills =====
    console.log("Creating skills...");
    const skillsData = [
      { name: "Leadership", category: "personal" },
      { name: "Teaching", category: "personal" },
      { name: "Collaboration", category: "interpersonal" },
      { name: "MS Suite", category: "technical" },
      { name: "Data Analytics", category: "technical" },
      { name: "Curriculum Design", category: "personal" },
      { name: "Public Speaking", category: "personal" },
      { name: "Project Management", category: "technical" },
    ];

    const skills: any[] = [];
    for (const s of skillsData) {
      try {
        const skill = await (prisma as any).skill.create({ data: s });
        skills.push(skill);
      } catch (e: any) {
        if (e.code === "P2002") {
          const existing = await (prisma as any).skill.findUnique({
            where: { name: s.name },
          });
          if (existing) skills.push(existing);
        } else throw e;
      }
    }
    console.log(`✅ ${skills.length} skills ready\n`);

    // ===== Geographic Data =====
    console.log("Creating regions...");
    const createOrFind = async (name: string, province: string) => {
      try {
        return await (prisma as any).localGov.create({
          data: { name, province },
        });
      } catch (e: any) {
        if (e.code === "P2002") {
          return await (prisma as any).localGov.findUnique({
            where: { name },
          });
        }
        throw e;
      }
    };

    const dang = await createOrFind("Dang", "Lumbini");
    const lumbini = await createOrFind("Kapilvastu", "Lumbini");
    console.log("✅ Regions ready\n");

    // ===== Schools =====
    console.log("Creating schools...");
    const createSchool = async (
      name: string,
      district: string,
      localGovId: string,
      type: string
    ) => {
      try {
        return await (prisma as any).school.create({
          data: { name, district, localGovId, sector: "Education", type },
        });
      } catch (e: any) {
        if (e.code === "P2002") {
          return await (prisma as any).school.findFirst({
            where: { name },
          });
        }
        throw e;
      }
    };

    const abcSchool = await createSchool(
      "Shree ABC Secondary School",
      "Gorahi",
      dang.id,
      "secondary"
    );
    const xyzSchool = await createSchool(
      "Shree XYZ Primary School",
      "Tulsipur",
      dang.id,
      "primary"
    );
    const madhavSchool = await createSchool(
      "Madhav Academy",
      "Itahari",
      lumbini.id,
      "secondary"
    );
    console.log("✅ 3 schools ready\n");

    // ===== Cohorts =====
    console.log("Creating cohorts...");
    const createCohort = async (name: string, startYear: number, endYear: number) => {
      try {
        return await (prisma as any).cohort.create({
          data: {
            name,
            fellowshipNStart: 60,
            fellowshipNEnd: 58,
            trainingN: 10,
            description: `${name} cohort (${startYear}-${endYear})`,
            start: new Date(`${startYear}-01-15`),
            end: new Date(`${endYear}-01-15`),
          },
        });
      } catch (e: any) {
        if (e.code === "P2002") {
          return await (prisma as any).cohort.findUnique({
            where: { name },
          });
        }
        throw e;
      }
    };

    const tesroPaaila = await createCohort("Tesro Paaila", 2015, 2017);
    const aatmaPaaila = await createCohort("Aatma Paaila", 2018, 2020);
    console.log("✅ 2 cohorts ready\n");

    // ===== Alumni Profiles =====
    console.log("Creating alumni...");
    const createPerson = async (
      firstName: string,
      lastName: string,
      email: string,
      bio: string,
      type: string = "alumni"
    ) => {
      try {
        return await (prisma as any).person.create({
          data: {
            firstName,
            lastName,
            email1: email,
            dob: new Date("1990-03-15"),
            bio,
            type,
            empStatus: type === "LDC" ? "employed" : "employed",
            eduStatus: "completed",
          },
        });
      } catch (e: any) {
        if (e.code === "P2002") {
          return await (prisma as any).person.findUnique({
            where: { email1: email },
          });
        }
        throw e;
      }
    };

    const ramesh = await createPerson(
      "Ramesh",
      "Sharma",
      "ramesh.sharma@example.com",
      "Program Director at Nepal Education Foundation. Tesro Paaila fellow with 8+ years of experience."
    );

    const anjali = await createPerson(
      "Anjali",
      "Poudel",
      "anjali.poudel@example.com",
      "Education specialist with focus on inclusive learning. Seeking workshop facilitator roles.",
      "alumni"
    );

    const pradeep = await createPerson(
      "Pradeep",
      "Khatri",
      "pradeep.khatri@example.com",
      "Principal at Madhav Academy. Actively recruiting education professionals.",
      "school"
    );

    const sita = await createPerson(
      "Sita",
      "Thapa",
      "sita.thapa@tfn.org",
      "Leadership Development Coordinator managing 15 fellows across Lumbini.",
      "LDC"
    );

    console.log("✅ 4 alumni/staff created\n");

    // ===== Activity Feed Posts =====
    console.log("Creating posts...");
    const posts = [
      {
        personId: ramesh.id,
        content:
          "🎓 Excited to announce Master's in Educational Leadership! Ready to bring insights back to Nepal's education sector. #TFNAlumni",
        postType: "achievement",
      },
      {
        personId: sita.id,
        content:
          "📊 Tesro Paaila: 58/60 fellows employed, 85% in education sector. Proud of our impact! #TFN",
        postType: "career_update",
      },
      {
        personId: pradeep.id,
        content:
          "🏫 Madhav Academy hiring! Seeking passionate educators to join our team.",
        postType: "job_posting",
      },
      {
        personId: anjali.id,
        content:
          "After 6 years teaching, exploring new opportunities. Looking for workshop facilitator roles. Open to collaboration! 🌱",
        postType: "career_update",
      },
    ];

    for (const post of posts) {
      try {
        await (prisma as any).post.create({
          data: { ...post, likes: Math.floor(Math.random() * 30) },
        });
      } catch (e: any) {
        // Post may already exist
      }
    }
    console.log(`✅ ${posts.length} posts created\n`);

    console.log("🎉 Database seeded successfully!");
    console.log("✨ Your TFN-Connect platform is ready!");
  } catch (e) {
    console.error("❌ Error:", e);
    throw e;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Test connection
  try {
    await prisma.$executeRaw`SELECT 1`;
    console.log("✓ Database connection successful");
  } catch (e) {
    console.error("✗ Database connection failed:", e);
    throw e;
  }

  // Clear existing data
  try {
    console.log("prisma.comment:", (prisma as any).comment);
    console.log("prisma.comment.deleteMany:", (prisma as any).comment?.deleteMany);
    await (prisma as any).comment.deleteMany({});
  } catch (e) {
    console.error("Error clearing comments:", e);
  }

  // ===== Skills =====
  const skillsData = [
    { name: "Leadership", category: "personal" },
    { name: "Teaching", category: "personal" },
    { name: "Collaboration", category: "interpersonal" },
    { name: "MS Suite", category: "technical" },
    { name: "Data Analytics", category: "technical" },
    { name: "Curriculum Design", category: "personal" },
    { name: "Public Speaking", category: "personal" },
    { name: "Project Management", category: "technical" },
  ];

  const skills = await Promise.all(
    skillsData.map((s) => prisma.skill.create({ data: s }))
  );

  console.log("✅ Skills created");

  // ===== Geographic Data =====
  const dang = await prisma.localGov.create({
    data: {
      name: "Dang",
      province: "Lumbini",
    },
  });

  const lumbini = await prisma.localGov.create({
    data: {
      name: "Kapilvastu",
      province: "Lumbini",
    },
  });

  console.log("✅ Regions created");

  // ===== Schools =====
  const abcSchool = await prisma.school.create({
    data: {
      name: "Shree ABC Secondary School",
      district: "Gorahi",
      localGovId: dang.id,
      sector: "Education",
      type: "secondary",
    },
  });

  const xyzSchool = await prisma.school.create({
    data: {
      name: "Shree XYZ Primary School",
      district: "Tulsipur",
      localGovId: dang.id,
      sector: "Education",
      type: "primary",
    },
  });

  const madhavSchool = await prisma.school.create({
    data: {
      name: "Madhav Academy",
      district: "Itahari",
      localGovId: lumbini.id,
      sector: "Education",
      type: "secondary",
    },
  });

  console.log("✅ Schools created");

  // ===== School Groups =====
  await prisma.schoolGroup.create({
    data: {
      name: "Group 1",
      groupName: "Group 1 - Dang East",
      schoolId: abcSchool.id,
    },
  });

  // ===== Cohorts =====
  const tesroPaaila = await prisma.cohort.create({
    data: {
      name: "Tesro Paaila",
      fellowshipNStart: 60,
      fellowshipNEnd: 58,
      trainingN: 10,
      description: "2-year leadership fellowship program (2015-2017)",
      start: new Date("2015-01-15"),
      end: new Date("2017-01-15"),
    },
  });

  const aatmaPaaila = await prisma.cohort.create({
    data: {
      name: "Aatma Paaila",
      fellowshipNStart: 50,
      fellowshipNEnd: 48,
      trainingN: 8,
      description: "2-year advanced leadership fellowship (2018-2020)",
      start: new Date("2018-01-15"),
      end: new Date("2020-01-15"),
    },
  });

  console.log("✅ Cohorts created");

  // ===== People: RAMESH SHARMA (Alumni) =====
  const ramesh = await prisma.person.create({
    data: {
      firstName: "Ramesh",
      lastName: "Sharma",
      dob: new Date("1990-03-15"),
      email1: "ramesh.sharma@example.com",
      phone1: "98140123456",
      linkedin: "https://linkedin.com/in/rameshsharma",
      profileImage: "https://i.pravatar.cc/150?img=1",
      bio: "Education leader passionate about transforming learning outcomes in rural Nepal. Tesro Paaila fellow with 8 years of experience.",
      type: "alumni",
      empStatus: "employed",
      eduStatus: "completed",
    },
  });

  // Ramesh Education
  await prisma.education.create({
    data: {
      personId: ramesh.id,
      institution: "Tribhuvan University",
      level: "Bachelors",
      name: "Bachelor of Education",
      sector: "Education",
      start: new Date("2008-01-15"),
      end: new Date("2012-12-15"),
    },
  });

  // Ramesh Fellowship
  const rameshFellowship = await prisma.fellowship.create({
    data: {
      cohortId: tesroPaaila.id,
      personId: ramesh.id,
      years: 2,
      start: new Date("2015-01-15"),
      end: new Date("2017-01-15"),
    },
  });

  // Ramesh Experience 1: ABC School
  const rameshExp1 = await prisma.experience.create({
    data: {
      personId: ramesh.id,
      orgName: "Shree ABC Secondary School",
      title: "Program Coordinator",
      sector: "Education",
      type: "full_time",
      description: "Led curriculum development and teacher training initiatives",
      start: new Date("2017-02-01"),
      end: new Date("2021-06-30"),
      experienceSkills: {
        create: [
          { skillId: skills.find((s) => s.name === "Leadership")!.id },
          { skillId: skills.find((s) => s.name === "Teaching")!.id },
          { skillId: skills.find((s) => s.name === "Collaboration")!.id },
        ],
      },
    },
  });

  // Ramesh Experience 2: Current Role
  await prisma.experience.create({
    data: {
      personId: ramesh.id,
      orgName: "Nepal Education Foundation",
      title: "Program Director",
      sector: "Education",
      type: "full_time",
      description: "Strategic oversight of education programs across 5 districts",
      start: new Date("2021-07-01"),
      end: null,
      experienceSkills: {
        create: [
          { skillId: skills.find((s) => s.name === "Leadership")!.id },
          { skillId: skills.find((s) => s.name === "Project Management")!.id },
          { skillId: skills.find((s) => s.name === "MS Suite")!.id },
        ],
      },
    },
  });

  // Ramesh Placement
  await prisma.placement.create({
    data: {
      fellowshipId: rameshFellowship.id,
      schoolId: abcSchool.id,
      personId: ramesh.id,
      title: "Program Coordinator",
      startDate: new Date("2017-02-01"),
      endDate: new Date("2021-06-30"),
    },
  });

  console.log("✅ Ramesh Sharma (Alumni) created");

  // ===== People: SITA THAPA (LDC/Staff) =====
  const sita = await prisma.person.create({
    data: {
      firstName: "Sita",
      lastName: "Thapa",
      dob: new Date("1985-07-22"),
      email1: "sita.thapa@tfn.org",
      phone1: "98140654321",
      profileImage: "https://i.pravatar.cc/150?img=2",
      bio: "Leadership Development Coordinator for Tesro Paaila cohort. Manages 15 fellows and their placements across Lumbini Province.",
      type: "LDC",
      empStatus: "employed",
      eduStatus: "completed",
    },
  });

  // Sita Education
  await prisma.education.create({
    data: {
      personId: sita.id,
      institution: "Kathmandu University",
      level: "Masters",
      name: "Master of Arts in Development Studies",
      sector: "Development",
      start: new Date("2012-01-15"),
      end: new Date("2014-12-15"),
    },
  });

  // Sita Experience
  await prisma.experience.create({
    data: {
      personId: sita.id,
      orgName: "Teach For Nepal",
      title: "Leadership Development Coordinator",
      sector: "Education",
      type: "full_time",
      description: "Manages fellow development, placements, and cohort success metrics",
      start: new Date("2017-06-01"),
      end: null,
      experienceSkills: {
        create: [
          { skillId: skills.find((s) => s.name === "Leadership")!.id },
          { skillId: skills.find((s) => s.name === "Collaboration")!.id },
          { skillId: skills.find((s) => s.name === "Data Analytics")!.id },
        ],
      },
    },
  });

  // Sita LDC Assignment to Ramesh's Fellowship
  await prisma.ldc.create({
    data: {
      personId: sita.id,
      fellowshipId: rameshFellowship.id,
    },
  });

  console.log("✅ Sita Thapa (LDC) created");

  // ===== People: ANJALI POUDEL (Alumni, Currently Seeking) =====
  const anjali = await prisma.person.create({
    data: {
      firstName: "Anjali",
      lastName: "Poudel",
      dob: new Date("1992-05-10"),
      email1: "anjali.poudel@example.com",
      phone1: "98140789012",
      profileImage: "https://i.pravatar.cc/150?img=3",
      bio: "Education specialist with focus on inclusive learning. Seeking workshop facilitator or curriculum design roles.",
      type: "alumni",
      empStatus: "seeking",
      eduStatus: "completed",
    },
  });

  // Anjali Education
  await prisma.education.create({
    data: {
      personId: anjali.id,
      institution: "Tribhuvan University",
      level: "Bachelors",
      name: "Bachelor of Education",
      sector: "Education",
      start: new Date("2010-01-15"),
      end: new Date("2014-12-15"),
    },
  });

  // Anjali Fellowship
  const anjaliFellowship = await prisma.fellowship.create({
    data: {
      cohortId: tesroPaaila.id,
      personId: anjali.id,
      years: 2,
      start: new Date("2015-01-15"),
      end: new Date("2017-01-15"),
    },
  });

  // Anjali Experience
  const anjaliExp = await prisma.experience.create({
    data: {
      personId: anjali.id,
      orgName: "Shree XYZ Primary School",
      title: "Teacher & Curriculum Lead",
      sector: "Education",
      type: "full_time",
      description: "Developed inclusive curriculum for multi-grade classrooms",
      start: new Date("2017-02-01"),
      end: new Date("2023-12-31"),
      experienceSkills: {
        create: [
          { skillId: skills.find((s) => s.name === "Teaching")!.id },
          { skillId: skills.find((s) => s.name === "Curriculum Design")!.id },
          { skillId: skills.find((s) => s.name === "Collaboration")!.id },
        ],
      },
    },
  });

  // Anjali Placement
  await prisma.placement.create({
    data: {
      fellowshipId: anjaliFellowship.id,
      schoolId: xyzSchool.id,
      personId: anjali.id,
      title: "Teacher",
      startDate: new Date("2017-02-01"),
      endDate: new Date("2023-12-31"),
    },
  });

  console.log("✅ Anjali Poudel (Alumni) created");

  // ===== People: PRADEEP KHATRI (Alumni, School Hiring) =====
  const pradeep = await prisma.person.create({
    data: {
      firstName: "Pradeep",
      lastName: "Khatri",
      dob: new Date("1988-11-30"),
      email1: "pradeep.khatri@example.com",
      phone1: "98140345678",
      profileImage: "https://i.pravatar.cc/150?img=4",
      bio: "Principal at Madhav Academy. TFN Tesro Paaila alumni. Actively recruiting education professionals.",
      type: "school",
      empStatus: "employed",
      eduStatus: "completed",
    },
  });

  // Pradeep Education
  await prisma.education.create({
    data: {
      personId: pradeep.id,
      institution: "Tribhuvan University",
      level: "Bachelors",
      name: "Bachelor of Education",
      sector: "Education",
      start: new Date("2006-01-15"),
      end: new Date("2010-12-15"),
    },
  });

  // Pradeep Fellowship
  const pradeepFellowship = await prisma.fellowship.create({
    data: {
      cohortId: aatmaPaaila.id,
      personId: pradeep.id,
      years: 2,
      start: new Date("2018-01-15"),
      end: new Date("2020-01-15"),
    },
  });

  // Pradeep Experience
  await prisma.experience.create({
    data: {
      personId: pradeep.id,
      orgName: "Madhav Academy",
      title: "Principal",
      sector: "Education",
      type: "full_time",
      description: "Leading transformational initiatives in academic excellence and student welfare",
      start: new Date("2020-02-01"),
      end: null,
      experienceSkills: {
        create: [
          { skillId: skills.find((s) => s.name === "Leadership")!.id },
          { skillId: skills.find((s) => s.name === "Project Management")!.id },
          { skillId: skills.find((s) => s.name === "Public Speaking")!.id },
        ],
      },
    },
  });

  // Pradeep Placement
  await prisma.placement.create({
    data: {
      fellowshipId: pradeepFellowship.id,
      schoolId: madhavSchool.id,
      personId: pradeep.id,
      title: "Teacher",
      startDate: new Date("2020-02-01"),
      endDate: null,
    },
  });

  console.log("✅ Pradeep Khatri (School) created");

  // ===== Job Postings =====
  const job1 = await prisma.jobPosting.create({
    data: {
      schoolId: madhavSchool.id,
      createdById: pradeep.id,
      title: "Math Coordinator",
      description:
        "Seeking experienced math educator to lead curriculum development and teacher training for secondary level. Preference for TFN alumni.",
      sector: "Education",
      location: "Itahari, Lumbini",
      jobType: "full_time",
      requiredSkills: JSON.stringify(["Teaching", "Curriculum Design", "Leadership"]),
      status: "open",
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      createdById: ramesh.id,
      title: "Education Program Manager",
      description:
        "Nepal Education Foundation seeks experienced program manager for rural education initiatives. 3+ years management experience required.",
      sector: "Education",
      location: "Dang, Lumbini",
      jobType: "full_time",
      requiredSkills: JSON.stringify([
        "Project Management",
        "Leadership",
        "Data Analytics",
      ]),
      status: "open",
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      schoolId: abcSchool.id,
      createdById: pradeep.id,
      title: "School Administrator",
      description:
        "ABC School seeking administrator with TFN background to manage school operations and teacher development.",
      sector: "Education",
      location: "Gorahi, Dang",
      jobType: "full_time",
      requiredSkills: JSON.stringify(["Leadership", "Project Management", "Collaboration"]),
      status: "open",
    },
  });

  console.log("✅ Job Postings created");

  // ===== Job Applications =====
  await prisma.jobApplication.create({
    data: {
      jobPostingId: job1.id,
      personId: anjali.id,
      status: "applied",
      message:
        "I'm very interested in this role. My curriculum design experience aligns perfectly with your needs.",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobPostingId: job3.id,
      personId: anjali.id,
      status: "reviewed",
      message: "Excited about contributing to ABC School's mission.",
    },
  });

  console.log("✅ Job Applications created");

  // ===== Activity Feed: Posts =====
  const post1 = await prisma.post.create({
    data: {
      personId: ramesh.id,
      content:
        "🎓 Excited to announce that I've just completed a Master's in Educational Leadership from Harvard! Ready to bring these insights back to Nepal's education sector. #TFNAlumni #Leadership",
      postType: "achievement",
      likes: 24,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      personId: sita.id,
      content:
        "📊 Tesro Paaila cohort update: 58/60 fellows employed, 85% in education sector, 12+ placed as leaders. Proud of our community's impact! #TFN #Impact",
      postType: "career_update",
      likes: 18,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      personId: pradeep.id,
      content:
        "🏫 Madhav Academy is hiring! We're looking for passionate educators to join our team. If you're interested in transforming rural education, apply now. Link in bio.",
      postType: "job_posting",
      likes: 12,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      personId: anjali.id,
      content:
        "After 6 years of teaching in rural Nepal, I'm now exploring new opportunities. Looking for workshop facilitator or curriculum design roles. Open to opportunities! 🌱",
      postType: "career_update",
      likes: 8,
    },
  });

  console.log("✅ Posts created");

  // ===== Comments =====
  await prisma.comment.create({
    data: {
      postId: post1.id,
      personId: sita.id,
      content:
        "Congratulations Ramesh! This is amazing news. The education sector in Nepal will benefit greatly from your new skills!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      personId: ramesh.id,
      content:
        "Sita, these numbers are incredible. The Tesro Paaila impact is undeniable. Let's keep pushing forward!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      personId: anjali.id,
      content:
        "Pradeep, I'd love to discuss the Math Coordinator position. Can we connect?",
    },
  });

  console.log("✅ Comments created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
