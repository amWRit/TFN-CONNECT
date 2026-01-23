import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.person.updateMany({
    where: { type: "LEADERSHIP" },
    data: { eduStatus: "NA" as any, empStatus: "NA" as any },
  });
  console.log(`Updated ${result.count} LEADERSHIP people to NA status.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
