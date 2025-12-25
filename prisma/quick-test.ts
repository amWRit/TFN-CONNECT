console.log("Test started");
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  console.log("Connecting...");
  try {
    const result = await (prisma as any).$queryRaw`SELECT 1`;
    console.log("Connected!", result);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Done");
  }
})();
