// prisma/seed-complete.ts - FULL FELLOWSHIP PIPELINE
// Run: npx ts-node prisma/seed-alumni.ts

import { PrismaClient, SchoolType } from '@prisma/client';

const prisma = new PrismaClient();

// ===== CLEANUP TABLES BEFORE SEEDING =====
async function cleanup() {
  console.log('🧹 Dropping tables...');
  await prisma.$executeRaw`TRUNCATE TABLE "SchoolGroupSchool" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Placement" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cohort" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "SchoolGroup" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "School" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "LocalGov" CASCADE;`;
  console.log('✅ Tables cleaned!');
}

async function main() {
  console.log('🌱 Seeding COMPLETE Fellowship Pipeline...');

  // ===== 1. CLEANUP =====
  await cleanup();

  // ===== 2. LOCAL GOV (7 TFN Districts) =====
  console.log('📍 Seeding LocalGov...');
  const localGovData = [
    { name: 'Lalitpur', province: 'Bagmati Province' },
    { name: 'Sindhupalchok', province: 'Bagmati Province' },
    { name: 'Dhanusha', province: 'Madhesh Province' },
    { name: 'Dang', province: 'Lumbini Province' },
    { name: 'Lamjung', province: 'Gandaki Province' },
    { name: 'Parsa', province: 'Madhesh Province' },
    { name: 'Tanahun', province: 'Gandaki Province' },
  ];

  await prisma.localGov.createMany({ data: localGovData, skipDuplicates: true });
  const localGovs = await prisma.localGov.findMany({ where: { name: { in: localGovData.map(lg => lg.name) } } });
  
  const localGovMap = {
    'Lalitpur': localGovs.find(lg => lg.name === 'Lalitpur')!.id,
    'Sindhupalchok': localGovs.find(lg => lg.name === 'Sindhupalchok')!.id,
    'Dhanusha': localGovs.find(lg => lg.name === 'Dhanusha')!.id,
    'Dang': localGovs.find(lg => lg.name === 'Dang')!.id,
    'Lamjung': localGovs.find(lg => lg.name === 'Lamjung')!.id,
    'Parsa': localGovs.find(lg => lg.name === 'Parsa')!.id,
    'Tanahun': localGovs.find(lg => lg.name === 'Tanahun')!.id,
  };

  // ===== 3. SCHOOLS (Real TFN Schools) =====
  console.log('🏫 Seeding Schools...');
  const schoolData = [
    // Lalitpur (7 schools)
    { name: 'Jyotidaya Cooperative Secondary School, Chapagaon', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Chandeswory Secondary School, Simle', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Mahalaxmi Higher Secondary School, Lubhu', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Ganesh Secondary School, Dukuchhap', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Buddha Secondary School, Tikabhairab', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Siddhimangal Higher Secondary School, Siddhipur', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    { name: 'Udayakharka Secondary School, Chapagaon', localGovId: localGovMap.Lalitpur, district: 'Lalitpur' },
    
    // Sindhupalchok (6 schools)
    { name: 'Kalidevi Higher Secondary School, Pyutar', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    { name: 'Janabikash Secondary School, Nursery, Sangachok', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    { name: 'Bhimsen Secondary School, Khatrithok, Sangachok', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    { name: 'Terse Secondary School, Talamarang', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    { name: 'Indreswori Higher Secondary School, Melamchi', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    { name: 'Nawalpur Secondary School, Nawalpur', localGovId: localGovMap.Sindhupalchok, district: 'Sindhupalchok' },
    
    // Other districts (1-2 each)
    { name: 'MV Mithileshwar', localGovId: localGovMap.Dhanusha, district: 'Dhanusha' },
    { name: 'Kushmawati Secondary School', localGovId: localGovMap.Dang, district: 'Dang' },
    { name: 'Lamjung Model School', localGovId: localGovMap.Lamjung, district: 'Lamjung' },
    { name: 'Birgunj Public School', localGovId: localGovMap.Parsa, district: 'Parsa' },
    { name: 'Pragati Secondary School', localGovId: localGovMap.Tanahun, district: 'Tanahun' },
  ];

  await prisma.school.createMany({
    data: schoolData.map(school => ({ ...school, type: SchoolType.SECONDARY })),
    skipDuplicates: true,
  });

  // ===== 4. SCHOOL GROUPS =====
  console.log('🏢 Seeding SchoolGroups...');
  const schoolGroupData = [
    { name: 'Lalitpur Cluster 1 (Chapagaon)', localGovId: localGovMap.Lalitpur },
    { name: 'Lalitpur Cluster 2 (Lubhu)', localGovId: localGovMap.Lalitpur },
    { name: 'Sindhupalchok Cluster 1 (Sangachok)', localGovId: localGovMap.Sindhupalchok },
    { name: 'Sindhupalchok Cluster 2 (Melamchi)', localGovId: localGovMap.Sindhupalchok },
    { name: 'Dhanusha Cluster 1 (Terai)', localGovId: localGovMap.Dhanusha },
    { name: 'Dang Cluster 1 (Lumbini)', localGovId: localGovMap.Dang },
    { name: 'Lamjung Cluster 1 (Hilly)', localGovId: localGovMap.Lamjung },
    { name: 'Parsa Cluster 1 (Birgunj)', localGovId: localGovMap.Parsa },
    { name: 'Tanahun Cluster 1 (Riverside)', localGovId: localGovMap.Tanahun },
  ];

  await prisma.schoolGroup.createMany({ data: schoolGroupData, skipDuplicates: true });

  // ===== 5. COHORTS (2013-2026) =====
  console.log('🎓 Seeding Cohorts...');
  const cohorts = [];
  for (let year = 2013; year <= 2026; year++) {
    const cohortNum = year - 2012;
    const cohortName = cohortNum === 1 ? 'First Cohort' : `${cohortNum}th Cohort`;
    const description = cohortNum === 1 ? 'First Cohort of Teach For Nepal' : `${cohortNum}th Cohort of Teach For Nepal`;
    const startDate = new Date(`${year}-01-01`);
    const endDate = year < 2025 ? new Date(`${year + 2}-01-01`) : undefined;
    
    cohorts.push({ name: cohortName, description, start: startDate, end: endDate });
  }

  await prisma.cohort.createMany({ data: cohorts, skipDuplicates: true });

  // ===== 6. PLACEMENTS (1 per School) =====
  console.log('🏫 Seeding Placements...');
  const managerId = 'cmk83ba7200025hdwzpwxp0c7';
  
  // Verify manager exists
  const manager = await prisma.person.findUnique({ where: { id: managerId } });
  if (!manager) {
    console.error('❌ Manager cmk83ba7200025hdwzpwxp0c7 not found! Create person first.');
    process.exit(1);
  }

  const schools = await prisma.school.findMany();
  for (const school of schools) {
    // Find matching school group by localGov
    const schoolGroup = await prisma.schoolGroup.findFirst({
      where: { localGovId: school.localGovId }
    });

    await prisma.placement.upsert({
      where: { schoolId: school.id },
      update: {},
      create: {
        name: `${school.name} Placement`,
        schoolId: school.id,
        schoolGroupId: schoolGroup?.id || null,
        managerId: managerId,
        fellowCount: 3,
        subjects: ['English', 'Mathematics', 'Science'],
      },
    });
  }

  // ===== SUMMARY =====
  const [localGovCount, schoolCount, schoolGroupCount, cohortCount, placementCount] = await Promise.all([
    prisma.localGov.count(),
    prisma.school.count(),
    prisma.schoolGroup.count(),
    prisma.cohort.count(),
    prisma.placement.count(),
  ]);

  console.log('\n📊 FINAL SUMMARY:');
  console.log(`├── LocalGov: ${localGovCount} districts`);
  console.log(`├── Schools: ${schoolCount} real TFN schools`);
  console.log(`├── SchoolGroups: ${schoolGroupCount} clusters`);
  console.log(`├── Cohorts: ${cohortCount} (2013-2026)`);
  console.log(`└── Placements: ${placementCount} (1 per school)`);
  console.log(`\n🎉 FULL FELLOWSHIP PIPELINE READY!`);
  console.log(`⏭️  Next: Seed Fellows!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
