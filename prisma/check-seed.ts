import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const people = await prisma.person.count();
    const posts = await prisma.post.count();
    const jobs = await prisma.jobPosting.count();
    const comments = await prisma.comment.count();
    const apps = await prisma.jobApplication.count();
    const skills = await prisma.skill.count();
    const fellowships = await prisma.fellowship.count();

    console.log("✨ TFN-Connect Database Status:\n");
    console.log(`📋 People/Alumni:        ${people}`);
    console.log(`📝 Activity Feed Posts:  ${posts}`);
    console.log(`💼 Job Postings:         ${jobs}`);
    console.log(`💬 Comments:             ${comments}`);
    console.log(`📮 Job Applications:     ${apps}`);
    console.log(`🎯 Skills:               ${skills}`);
    console.log(`🎓 Fellowships:          ${fellowships}`);
    console.log("\n✅ Comprehensive seed data is ready!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
