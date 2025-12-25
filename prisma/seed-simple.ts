import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`;
    console.log("✓ Database connected");

    // Create skills
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
          // Unique constraint violation - skill already exists
          const existing = await (prisma as any).skill.findUnique({
            where: { name: s.name },
          });
          if (existing) skills.push(existing);
        } else {
          throw e;
        }
      }
    }
    console.log("✅ Skills created/found:", skills.length);

    // Create regions
    console.log("Creating regions...");
    let dang: any;
    try {
      dang = await (prisma as any).localGov.create({
        data: { name: "Dang", province: "Lumbini" },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        dang = await (prisma as any).localGov.findUnique({
          where: { name: "Dang" },
        });
      } else {
        throw e;
      }
    }
    console.log("✅ Dang region ready");

    let lumbini: any;
    try {
      lumbini = await (prisma as any).localGov.create({
        data: { name: "Kapilvastu", province: "Lumbini" },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        lumbini = await (prisma as any).localGov.findUnique({
          where: { name: "Kapilvastu" },
        });
      } else {
        throw e;
      }
    }
    console.log("✅ Kapilvastu region ready");

    // Create schools
    console.log("Creating schools...");
    let abcSchool: any;
    try {
      abcSchool = await (prisma as any).school.create({
        data: {
          name: "Shree ABC Secondary School",
          district: "Gorahi",
          localGovId: dang.id,
          sector: "Education",
          type: "secondary",
        },
      });
    } catch (e: any) {
      console.log("School creation error:", e.message);
      abcSchool = await (prisma as any).school.findFirst({
        where: { name: "Shree ABC Secondary School" },
      });
    }
    console.log("✅ ABC School ready");

    // Create cohort
    console.log("Creating cohort...");
    let tesroPaaila: any;
    try {
      tesroPaaila = await (prisma as any).cohort.create({
        data: {
          name: "Tesro Paaila",
          fellowshipNStart: 60,
          fellowshipNEnd: 58,
          trainingN: 10,
          description: "2-year leadership fellowship program",
          start: new Date("2015-01-15"),
          end: new Date("2017-01-15"),
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        tesroPaaila = await (prisma as any).cohort.findUnique({
          where: { name: "Tesro Paaila" },
        });
      } else {
        throw e;
      }
    }
    console.log("✅ Tesro Paaila cohort ready");

    // Create person (Ramesh)
    console.log("Creating Ramesh Sharma...");
    let ramesh: any;
    try {
      ramesh = await (prisma as any).person.create({
        data: {
          firstName: "Ramesh",
          lastName: "Sharma",
          dob: new Date("1990-03-15"),
          email1: "ramesh.sharma@example.com",
          phone1: "98140123456",
          bio: "Education leader passionate about transforming learning outcomes",
          type: "alumni",
          empStatus: "employed",
          eduStatus: "completed",
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        ramesh = await (prisma as any).person.findUnique({
          where: { email1: "ramesh.sharma@example.com" },
        });
      } else {
        throw e;
      }
    }
    console.log("✅ Ramesh created");

    console.log("\n🎉 Database seeded successfully!");
  } catch (e) {
    console.error("Error during seeding:", e);
    throw e;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✓ Prisma disconnected");
  })
  .catch(async (e) => {
    console.error("Fatal error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
