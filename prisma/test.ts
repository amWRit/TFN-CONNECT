import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma methods...");
  console.log("All Prisma properties:");
  const props = Object.keys(prisma).filter(k => !k.startsWith('_'));
  props.forEach(p => console.log(" -", p));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

