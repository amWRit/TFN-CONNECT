import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed with comprehensive data...\n");

  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`;
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
        const skill = await prisma.skill.upsert({
          where: { name: s.name },
          update: {},
          create: s,
        });
        skills.push(skill);
      } catch (e) {
        console.log(`Skill ${s.name} error:`, e);
      }
    }
    console.log(`✅ ${skills.length} skills ready\n`);

    // ===== Geographic Data =====
    console.log("Creating regions...");
    const dang = await prisma.localGov.upsert({
      where: { name: "Dang" },
      update: {},
      create: { name: "Dang", province: "Lumbini" },
    });

    const kapilvastu = await prisma.localGov.upsert({
      where: { name: "Kapilvastu" },
      update: {},
      create: { name: "Kapilvastu", province: "Lumbini" },
    });
    console.log("✅ 2 regions ready\n");

    // ===== Schools =====
    console.log("Creating schools...");
    const abcSchool = await prisma.school.upsert({
      where: { id: "abc-1" },
      update: {},
      create: {
        id: "abc-1",
        name: "Shree ABC Secondary School",
        district: "Gorahi",
        localGovId: dang.id,
        sector: "Education",
        type: "secondary",
      },
    });

    const xyzSchool = await prisma.school.upsert({
      where: { id: "xyz-1" },
      update: {},
      create: {
        id: "xyz-1",
        name: "Shree XYZ Primary School",
        district: "Tulsipur",
        localGovId: dang.id,
        sector: "Education",
        type: "primary",
      },
    });

    const madhavSchool = await prisma.school.upsert({
      where: { id: "madhav-1" },
      update: {},
      create: {
        id: "madhav-1",
        name: "Madhav Academy",
        district: "Itahari",
        localGovId: kapilvastu.id,
        sector: "Education",
        type: "secondary",
      },
    });
    console.log("✅ 3 schools ready\n");

    // ===== Cohorts =====
    console.log("Creating cohorts...");
    const tesroPaaila = await prisma.cohort.upsert({
      where: { name: "Tesro Paaila" },
      update: {},
      create: {
        name: "Tesro Paaila",
        fellowshipNStart: 60,
        fellowshipNEnd: 58,
        trainingN: 10,
        description: "2-year leadership fellowship program (2015-2017)",
        start: new Date("2015-01-15"),
        end: new Date("2017-01-15"),
      },
    });

    const aatmaPaaila = await prisma.cohort.upsert({
      where: { name: "Aatma Paaila" },
      update: {},
      create: {
        name: "Aatma Paaila",
        fellowshipNStart: 50,
        fellowshipNEnd: 48,
        trainingN: 8,
        description: "2-year advanced leadership fellowship (2018-2020)",
        start: new Date("2018-01-15"),
        end: new Date("2020-01-15"),
      },
    });
    console.log("✅ 2 cohorts ready\n");

    const findSkillId = (name: string) =>
      skills.find((s) => s.name === name)?.id;

    // ===== Creating Alumni =====
    console.log("Creating 8 diverse alumni profiles...\n");

    // RAMESH
    const ramesh = await prisma.person.upsert({
      where: { email1: "ramesh.sharma@example.com" },
      update: {},
      create: {
        firstName: "Ramesh",
        lastName: "Sharma",
        dob: new Date("1990-03-15"),
        email1: "ramesh.sharma@example.com",
        phone1: "98140123456",
        profileImage: "https://i.pravatar.cc/150?img=1",
        bio: "Program Director at Nepal Education Foundation. Tesro Paaila fellow with 8+ years in education.",
        type: "alumni",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    await prisma.education.upsert({
      where: { id: "ramesh-edu-1" },
      update: {},
      create: {
        id: "ramesh-edu-1",
        personId: ramesh.id,
        institution: "Tribhuvan University",
        level: "Bachelors",
        name: "Bachelor of Education",
        sector: "Education",
        start: new Date("2008-01-15"),
        end: new Date("2012-12-15"),
      },
    });

    const rameshFellow = await prisma.fellowship.upsert({
      where: { id: "ramesh-fellow-1" },
      update: {},
      create: {
        id: "ramesh-fellow-1",
        cohortId: tesroPaaila.id,
        personId: ramesh.id,
        years: 2,
        start: new Date("2015-01-15"),
        end: new Date("2017-01-15"),
      },
    });

    await prisma.experience.upsert({
      where: { id: "ramesh-exp-1" },
      update: {},
      create: {
        id: "ramesh-exp-1",
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
            { skillId: findSkillId("Leadership")! },
            { skillId: findSkillId("Teaching")! },
            { skillId: findSkillId("Collaboration")! },
          ],
        },
      },
    });

    await prisma.experience.upsert({
      where: { id: "ramesh-exp-2" },
      update: {},
      create: {
        id: "ramesh-exp-2",
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
            { skillId: findSkillId("Leadership")! },
            { skillId: findSkillId("Project Management")! },
            { skillId: findSkillId("MS Suite")! },
          ],
        },
      },
    });

    console.log("✅ Ramesh Sharma (Program Director)");

    // SITA
    const sita = await prisma.person.upsert({
      where: { email1: "sita.thapa@tfn.org" },
      update: {},
      create: {
        firstName: "Sita",
        lastName: "Thapa",
        dob: new Date("1985-07-22"),
        email1: "sita.thapa@tfn.org",
        phone1: "98140654321",
        profileImage: "https://i.pravatar.cc/150?img=2",
        bio: "Leadership Development Coordinator managing 15 fellows across Lumbini Province.",
        type: "LDC",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    await prisma.education.upsert({
      where: { id: "sita-edu-1" },
      update: {},
      create: {
        id: "sita-edu-1",
        personId: sita.id,
        institution: "Kathmandu University",
        level: "Masters",
        name: "Master of Arts in Development Studies",
        sector: "Development",
        start: new Date("2012-01-15"),
        end: new Date("2014-12-15"),
      },
    });

    await prisma.experience.upsert({
      where: { id: "sita-exp-1" },
      update: {},
      create: {
        id: "sita-exp-1",
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
            { skillId: findSkillId("Leadership")! },
            { skillId: findSkillId("Collaboration")! },
            { skillId: findSkillId("Data Analytics")! },
          ],
        },
      },
    });

    console.log("✅ Sita Thapa (LDC)");

    // ANJALI
    const anjali = await prisma.person.upsert({
      where: { email1: "anjali.poudel@example.com" },
      update: {},
      create: {
        firstName: "Anjali",
        lastName: "Poudel",
        dob: new Date("1992-05-10"),
        email1: "anjali.poudel@example.com",
        phone1: "98140789012",
        profileImage: "https://i.pravatar.cc/150?img=3",
        bio: "Education specialist with focus on inclusive learning. Seeking workshop facilitator roles.",
        type: "alumni",
        empStatus: "seeking",
        eduStatus: "completed",
      },
    });

    await prisma.education.upsert({
      where: { id: "anjali-edu-1" },
      update: {},
      create: {
        id: "anjali-edu-1",
        personId: anjali.id,
        institution: "Tribhuvan University",
        level: "Bachelors",
        name: "Bachelor of Education",
        sector: "Education",
        start: new Date("2010-01-15"),
        end: new Date("2014-12-15"),
      },
    });

    const anjaliFellow = await prisma.fellowship.upsert({
      where: { id: "anjali-fellow-1" },
      update: {},
      create: {
        id: "anjali-fellow-1",
        cohortId: tesroPaaila.id,
        personId: anjali.id,
        years: 2,
        start: new Date("2015-01-15"),
        end: new Date("2017-01-15"),
      },
    });

    await prisma.experience.upsert({
      where: { id: "anjali-exp-1" },
      update: {},
      create: {
        id: "anjali-exp-1",
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
            { skillId: findSkillId("Teaching")! },
            { skillId: findSkillId("Curriculum Design")! },
            { skillId: findSkillId("Collaboration")! },
          ],
        },
      },
    });

    console.log("✅ Anjali Poudel (Seeking)");

    // PRADEEP
    const pradeep = await prisma.person.upsert({
      where: { email1: "pradeep.khatri@example.com" },
      update: {},
      create: {
        firstName: "Pradeep",
        lastName: "Khatri",
        dob: new Date("1988-11-30"),
        email1: "pradeep.khatri@example.com",
        phone1: "98140345678",
        profileImage: "https://i.pravatar.cc/150?img=4",
        bio: "Principal at Madhav Academy. TFN alumni. Actively recruiting education professionals.",
        type: "school",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    await prisma.education.upsert({
      where: { id: "pradeep-edu-1" },
      update: {},
      create: {
        id: "pradeep-edu-1",
        personId: pradeep.id,
        institution: "Tribhuvan University",
        level: "Bachelors",
        name: "Bachelor of Education",
        sector: "Education",
        start: new Date("2006-01-15"),
        end: new Date("2010-12-15"),
      },
    });

    const pradeepFellow = await prisma.fellowship.upsert({
      where: { id: "pradeep-fellow-1" },
      update: {},
      create: {
        id: "pradeep-fellow-1",
        cohortId: aatmaPaaila.id,
        personId: pradeep.id,
        years: 2,
        start: new Date("2018-01-15"),
        end: new Date("2020-01-15"),
      },
    });

    await prisma.experience.upsert({
      where: { id: "pradeep-exp-1" },
      update: {},
      create: {
        id: "pradeep-exp-1",
        personId: pradeep.id,
        orgName: "Madhav Academy",
        title: "Principal",
        sector: "Education",
        type: "full_time",
        description: "Leading transformational initiatives in academic excellence",
        start: new Date("2020-02-01"),
        end: null,
        experienceSkills: {
          create: [
            { skillId: findSkillId("Leadership")! },
            { skillId: findSkillId("Project Management")! },
            { skillId: findSkillId("Public Speaking")! },
          ],
        },
      },
    });

    console.log("✅ Pradeep Khatri (Principal)");

    // BIKASH
    const bikash = await prisma.person.upsert({
      where: { email1: "bikash.magar@example.com" },
      update: {},
      create: {
        firstName: "Bikash",
        lastName: "Magar",
        dob: new Date("1994-09-18"),
        email1: "bikash.magar@example.com",
        phone1: "98140567890",
        profileImage: "https://i.pravatar.cc/150?img=5",
        bio: "Senior Teacher at ABC School. Passionate about technology in education.",
        type: "alumni",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    console.log("✅ Bikash Magar (Senior Teacher)");

    // DEEPA
    const deepa = await prisma.person.upsert({
      where: { email1: "deepa.sharma@example.com" },
      update: {},
      create: {
        firstName: "Deepa",
        lastName: "Sharma",
        dob: new Date("1991-02-28"),
        email1: "deepa.sharma@example.com",
        phone1: "98140234567",
        profileImage: "https://i.pravatar.cc/150?img=6",
        bio: "Deputy Principal exploring leadership opportunities and mentoring roles.",
        type: "alumni",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    console.log("✅ Deepa Sharma (Deputy Principal)");

    // KAMAL
    const kamal = await prisma.person.upsert({
      where: { email1: "kamal.rai@example.com" },
      update: {},
      create: {
        firstName: "Kamal",
        lastName: "Rai",
        dob: new Date("1993-06-12"),
        email1: "kamal.rai@example.com",
        phone1: "98140456123",
        profileImage: "https://i.pravatar.cc/150?img=7",
        bio: "Open to leadership roles, NGO positions, or curriculum development projects.",
        type: "alumni",
        empStatus: "seeking",
        eduStatus: "completed",
      },
    });

    console.log("✅ Kamal Rai (Seeking)");

    // MAYA
    const maya = await prisma.person.upsert({
      where: { email1: "maya.gurung@example.com" },
      update: {},
      create: {
        firstName: "Maya",
        lastName: "Gurung",
        dob: new Date("1990-04-05"),
        email1: "maya.gurung@example.com",
        phone1: "98140789456",
        profileImage: "https://i.pravatar.cc/150?img=8",
        bio: "Working on education policy and social impact programs.",
        type: "alumni",
        empStatus: "employed",
        eduStatus: "completed",
      },
    });

    console.log("✅ Maya Gurung (Program Officer)\n");

    // ===== Job Postings =====
    console.log("Creating 7 job postings...");

    const jobs = [
      {
        id: "job-1",
        schoolId: madhavSchool.id,
        createdById: pradeep.id,
        title: "Math Coordinator",
        description: "Seeking experienced math educator for curriculum development.",
        sector: "Education",
        location: "Itahari, Lumbini",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Teaching", "Curriculum Design", "Leadership"]),
        status: "open" as const,
      },
      {
        id: "job-2",
        createdById: ramesh.id,
        title: "Education Program Manager",
        description: "Seeking program manager for rural education initiatives.",
        sector: "Education",
        location: "Dang, Lumbini",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Project Management", "Leadership", "Data Analytics"]),
        status: "open" as const,
      },
      {
        id: "job-3",
        schoolId: abcSchool.id,
        createdById: pradeep.id,
        title: "School Administrator",
        description: "Seeking administrator with TFN background.",
        sector: "Education",
        location: "Gorahi, Dang",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Leadership", "Project Management", "Collaboration"]),
        status: "open" as const,
      },
      {
        id: "job-4",
        schoolId: xyzSchool.id,
        createdById: deepa.id,
        title: "Language Arts Teacher",
        description: "Seeking language arts teacher for primary school.",
        sector: "Education",
        location: "Tulsipur, Dang",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Teaching", "Collaboration", "Curriculum Design"]),
        status: "open" as const,
      },
      {
        id: "job-5",
        createdById: maya.id,
        title: "Education Research Associate",
        description: "Seeking research associate for education policy research.",
        sector: "NGO",
        location: "Kathmandu",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Data Analytics", "Project Management", "Teaching"]),
        status: "open" as const,
      },
      {
        id: "job-6",
        createdById: ramesh.id,
        title: "Teacher Training Specialist",
        description: "Hiring teacher training specialist for professional development.",
        sector: "Education",
        location: "Dang",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Leadership", "Teaching", "Curriculum Design"]),
        status: "open" as const,
      },
      {
        id: "job-7",
        schoolId: madhavSchool.id,
        createdById: pradeep.id,
        title: "School Counselor",
        description: "Seeking school counselor for student wellbeing.",
        sector: "Education",
        location: "Itahari, Lumbini",
        jobType: "full_time" as const,
        requiredSkills: JSON.stringify(["Collaboration", "Leadership", "Public Speaking"]),
        status: "open" as const,
      },
    ];

    for (const job of jobs) {
      await prisma.jobPosting.upsert({
        where: { id: job.id },
        update: {},
        create: job,
      });
    }
    console.log("✅ 7 job postings ready\n");

    // ===== Job Applications =====
    console.log("Creating 6 job applications...");

    const applications = [
      {
        id: "app-1",
        jobPostingId: jobs[0].id,
        personId: anjali.id,
        status: "applied" as const,
        message: "My curriculum design experience aligns with your needs.",
      },
      {
        id: "app-2",
        jobPostingId: jobs[2].id,
        personId: anjali.id,
        status: "reviewed" as const,
        message: "Excited about contributing to ABC School's mission.",
      },
      {
        id: "app-3",
        jobPostingId: jobs[3].id,
        personId: kamal.id,
        status: "applied" as const,
        message: "I have 5 years teaching experience.",
      },
      {
        id: "app-4",
        jobPostingId: jobs[4].id,
        personId: deepa.id,
        status: "reviewed" as const,
        message: "My background in education and leadership is a strong fit.",
      },
      {
        id: "app-5",
        jobPostingId: jobs[5].id,
        personId: bikash.id,
        status: "applied" as const,
        message: "I'm passionate about teacher development.",
      },
      {
        id: "app-6",
        jobPostingId: jobs[1].id,
        personId: deepa.id,
        status: "interviewed" as const,
        message: "Very interested in joining Nepal Education Foundation.",
      },
    ];

    for (const app of applications) {
      await prisma.jobApplication.upsert({
        where: { id: app.id },
        update: {},
        create: app,
      });
    }
    console.log("✅ 6 job applications ready\n");

    // ===== Activity Feed Posts =====
    console.log("Creating 14 activity feed posts...");

    const posts = [
      { id: "post-1", personId: ramesh.id, content: "🎓 Completed Master's in Educational Leadership! Ready to bring insights back. #TFNAlumni", postType: "achievement" as const, likes: 24 },
      { id: "post-2", personId: sita.id, content: "📊 Tesro Paaila: 58/60 fellows employed, 85% in education. Proud of our impact! #TFN", postType: "career_update" as const, likes: 18 },
      { id: "post-3", personId: pradeep.id, content: "🏫 Madhav Academy is hiring! Join us transforming rural education.", postType: "job_posting" as const, likes: 12 },
      { id: "post-4", personId: anjali.id, content: "After 6 years teaching, exploring new opportunities. Looking for facilitator roles. #OpenToOpportunities", postType: "career_update" as const, likes: 8 },
      { id: "post-5", personId: bikash.id, content: "🚀 New digital learning at ABC School! Students showing remarkable improvement. #EdTech", postType: "achievement" as const, likes: 32 },
      { id: "post-6", personId: deepa.id, content: "📚 Launched mentorship program connecting experienced teachers with new staff.", postType: "achievement" as const, likes: 19 },
      { id: "post-7", personId: kamal.id, content: "🌟 Ready for next chapter! Seeking roles to scale impact in policy or curriculum development.", postType: "career_update" as const, likes: 14 },
      { id: "post-8", personId: maya.id, content: "🎯 Completed research on rural education access. Insights powerful - systemic change needed.", postType: "achievement" as const, likes: 27 },
      { id: "post-9", personId: ramesh.id, content: "🏆 Keynote speaker at National Education Summit! Sharing teacher development framework. #EdLeadership", postType: "achievement" as const, likes: 41 },
      { id: "post-10", personId: sita.id, content: "👥 Celebrating Tesro Paaila alumni! From principals to policy researchers. #TFNImpact", postType: "achievement" as const, likes: 35 },
      { id: "post-11", personId: pradeep.id, content: "💼 Madhav Academy actively hiring! Multiple positions open. Join our team!", postType: "job_posting" as const, likes: 9 },
      { id: "post-12", personId: anjali.id, content: "🤝 Thanks TFN community for support in career transition. Your advice is invaluable!", postType: "career_update" as const, likes: 22 },
      { id: "post-13", personId: bikash.id, content: "📖 New blog: 'Technology in Rural Classrooms' - practical insights from our school.", postType: "achievement" as const, likes: 16 },
      { id: "post-14", personId: deepa.id, content: "🎓 Mentoring TFN fellows this year. Excited to support their growth!", postType: "career_update" as const, likes: 18 },
    ];

    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: {},
        create: post,
      });
    }
    console.log("✅ 14 posts ready\n");

    // ===== Comments =====
    console.log("Creating 15 comments...");

    const comments = [
      { id: "cmt-1", postId: posts[0].id, personId: sita.id, content: "Congratulations Ramesh! Nepal's education sector will benefit!" },
      { id: "cmt-2", postId: posts[1].id, personId: ramesh.id, content: "Sita, incredible numbers. Tesro Paaila's impact is undeniable!" },
      { id: "cmt-3", postId: posts[2].id, personId: anjali.id, content: "Pradeep, I'd love to discuss the Math Coordinator position!" },
      { id: "cmt-4", postId: posts[4].id, personId: ramesh.id, content: "Bikash, fantastic! Tech integration is our strategic priority." },
      { id: "cmt-5", postId: posts[4].id, personId: sita.id, content: "Love this innovation! Keep pushing boundaries!" },
      { id: "cmt-6", postId: posts[5].id, personId: deepa.id, content: "Deepa, brilliant! Can we discuss replicating at other schools?" },
      { id: "cmt-7", postId: posts[6].id, personId: ramesh.id, content: "Kamal, you'd be perfect for our Program Manager role!" },
      { id: "cmt-8", postId: posts[6].id, personId: maya.id, content: "Kamal, great NGO opportunities available. Happy to connect!" },
      { id: "cmt-9", postId: posts[7].id, personId: ramesh.id, content: "Maya, exactly what the sector needs. Let's discuss policy!" },
      { id: "cmt-10", postId: posts[8].id, personId: sita.id, content: "Ramesh, your frameworks transformed our approach. Well-deserved!" },
      { id: "cmt-11", postId: posts[9].id, personId: anjali.id, content: "Sita, grateful to be part of this community!" },
      { id: "cmt-12", postId: posts[10].id, personId: bikash.id, content: "Pradeep, excellent initiatives! Would recommend to colleagues." },
      { id: "cmt-13", postId: posts[11].id, personId: deepa.id, content: "Anjali, you're fantastic. Whoever gets you will be lucky!" },
      { id: "cmt-14", postId: posts[12].id, personId: deepa.id, content: "Bikash, always insightful! More educators need to read this." },
      { id: "cmt-15", postId: posts[13].id, personId: bikash.id, content: "Deepa, mentoring is rewarding. Learned as much from them!" },
    ];

    for (const comment of comments) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {},
        create: comment,
      });
    }
    console.log("✅ 15 comments ready\n");

    console.log("🎉 Database seeded successfully!");
    console.log("✨ TFN-Connect now has:");
    console.log("   ✓ 8 diverse alumni/staff profiles");
    console.log("   ✓ 7 job postings");
    console.log("   ✓ 14 activity feed posts");
    console.log("   ✓ 15 community comments");
    console.log("   ✓ 6 job applications");
    console.log("   ✓ Complete fellowship data");
  } catch (e) {
    console.error("❌ Seeding error:", e);
    throw e;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✨ Seed complete!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
