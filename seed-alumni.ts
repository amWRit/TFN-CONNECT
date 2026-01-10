// prisma/seed-alumni-csv.ts - SEED PERSONS FROM CSV WITH FULL NAME SPLITTING
// Run: npx ts-node prisma/seed-alumni.ts

import { PrismaClient, PersonType, EduStatus, EmpStatus } from '@prisma/client';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseName(name: string): { firstName: string; middleName: string; lastName: string } {
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: parts[0] };
  }
  
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  }
  
  // 3+ parts: first, middle(s), last
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
}

function extractEmail(emailStr: string): string {
  // Extract email from markdown: [email@domain.com](mailto:email@domain.com)
  const match = emailStr.match(/\[([^\]]+)\]\(mailto:([^\)]+)\)/);
  return match ? match[2] || match[1] : emailStr.trim();
}

async function seedFromCSV(csvFilePath: string) {
  console.log('🌱 Starting alumni seeding from CSV...');
  
  let count = 0;

  const operations: Promise<unknown>[] = [];

  return new Promise((resolve, reject) => {
    createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: any) => {
        // Schedule async work but don't await inside the event handler
        const op = (async () => {
          try {
            // Expected CSV: fullName,email (one per line)
            if (row.fullName && row.email) {
              const email = extractEmail(row.email).toLowerCase().trim();
              const nameData = parseName(row.fullName);
              
              // Skip if no valid email
              if (!email || !email.includes('@')) {
                console.log(`⚠️ Skipping invalid email: ${row.email}`);
                return;
              }

              await prisma.person.upsert({
                where: { email1: email },
                update: {},
                create: {
                  firstName: nameData.firstName,
                  middleName: nameData.middleName,
                  lastName: nameData.lastName,
                  email1: email,
                  type: PersonType.ALUMNI,
                  eduStatus: EduStatus.COMPLETED,
                  empStatus: EmpStatus.EMPLOYED,
                  pronouns: '',
                  bio: '',
                }
              });
              
              count++;
              if (count % 10 === 0) {
                console.log(`✅ Seeded ${count} alumni...`);
              }
            }
          } catch (error) {
            console.error(`❌ Error processing row: ${row.fullName} - ${row.email}`, error);
          }
        })();

        operations.push(op);
      })
      .on('end', async () => {
        try {
          await Promise.all(operations);
          console.log(`🎉 Seeding complete! Total ${count} alumni seeded.`);
        } catch (e) {
          console.error('❌ One or more operations failed during seeding.', e);
        } finally {
          await prisma.$disconnect();
          resolve(true);
        }
      })
      .on('error', (error: Error) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      });
  });
}

// MAIN EXECUTION
async function main() {
  try {
    const csvPath = path.join(process.cwd(), 'prisma', 'alumni.csv');
    console.log(`📁 Reading CSV from: ${csvPath}`);
    
    await seedFromCSV(csvPath);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();
