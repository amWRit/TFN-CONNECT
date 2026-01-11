// prisma/seed-events-rsvps.ts - SEED EVENTS + RSVPS WITH SAMPLE DATA
// Run: npx ts-node prisma/seed-events-rsvps.ts

import { PrismaClient, EventType, EventStatus } from '@prisma/client';
import { addDays, addHours, startOfWeek } from 'date-fns';

const prisma = new PrismaClient();

// Sample Person IDs (your provided users)
const SAMPLE_USERS = [
  'cmk1emcta000q20bgbpqhfmif',
  'cmk1emde5000r20bgjgr4ym8e',
  'cmk1emde5000s20bghxpwt9a5',
  'cmk1emde5000t20bg56gkeyfn',
  'cmk1emde5000u20bgwpgshwjt',
  'cmk1emde5000v20bgxq11uttx',
  'cmk1etkic0000xq78pneulwrz',
  'cmk83ba7200025hdwzpwxp0c7',
];

async function seedEvents() {
  console.log('🌟 Seeding sample events...');

  const eventsData = [
    {
      title: 'TFN Alumni Networking Night',
      slug: 'tfn-alumni-networking-jan-2026',
      description: 'Connect with fellow alumni, share updates, and explore collaboration opportunities.',
      overview: 'Casual networking event for TFN alumni in Kathmandu.',
      location: 'Kathmandu',
      address: 'Civil Mall, Sundhara, Kathmandu',
      latitude: 27.6833,
      longitude: 85.3167,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      tags: ['networking', 'alumni', 'kathmandu', 'in-person'],
      externalLink: 'https://tfn.events/alumni-networking',
      sponsors: ['Teach For Nepal', 'Partner Corp'],
      startDateTime: new Date('2026-01-25T18:00:00+0545'),
      endDateTime: new Date('2026-01-25T21:00:00+0545'),
      type: EventType.NETWORKING,
      status: EventStatus.PUBLISHED,
      capacity: 100,
      isFree: true,
      organizerName: 'TFN Alumni Team',
    },
    {
      title: 'Career Development Workshop',
      slug: 'career-workshop-virtual-feb-2026',
      description: 'Resume building, interview skills, and career strategy session.',
      overview: 'Virtual workshop to boost your career prospects.',
      location: 'Virtual',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      tags: ['career', 'skills', 'virtual', 'workshop'],
      externalLink: 'https://zoom.us/j/123456789',
      startDateTime: new Date('2026-02-05T19:00:00+0545'),
      endDateTime: new Date('2026-02-05T21:00:00+0545'),
      type: EventType.WORKSHOP,
      status: EventStatus.PUBLISHED,
      capacity: 50,
      isFree: true,
      organizerName: 'Career Services',
    },
    {
      title: 'Leadership Summit 2026',
      slug: 'leadership-summit-2026',
      description: 'Annual leadership conference for TFN community.',
      overview: 'Keynotes, panels, and interactive sessions on education leadership.',
      location: 'Kathmandu',
      address: 'Soaltee Crowne Plaza, Kathmandu',
      latitude: 27.7128,
      longitude: 85.3227,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      tags: ['leadership', 'conference', 'kathmandu'],
      sponsors: ['TFN Foundation', 'EduCorp', 'Govt Partners'],
      startDateTime: new Date('2026-03-15T09:00:00+0545'),
      endDateTime: new Date('2026-03-15T18:00:00+0545'),
      type: EventType.CONFERENCE,
      status: EventStatus.PUBLISHED,
      capacity: 300,
      isFree: false,
      price: 2500,
      organizerName: 'TFN Leadership Team',
    },
    {
      title: 'Mentorship Matching Session',
      slug: 'mentorship-matching-mar-2026',
      description: 'Get paired with a mentor for your career journey.',
      overview: 'Speed mentoring + networking for alumni.',
      location: 'Virtual',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-1d65c2791e2f?w=800',
      tags: ['mentorship', 'virtual', 'networking'],
      externalLink: 'https://forms.gle/mentorship2026',
      startDateTime: new Date('2026-03-20T16:00:00+0545'),
      endDateTime: new Date('2026-03-20T18:00:00+0545'),
      type: EventType.NETWORKING,
      status: EventStatus.PUBLISHED,
      capacity: 80,
      isFree: true,
    },
  ];

  // Create events (using first user as creator)
  const creatorId = SAMPLE_USERS[0];
  const createdEvents = [];

  for (const eventData of eventsData) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        createdById: creatorId,
        rsvpCount: 0,
      },
    });
    createdEvents.push(event);
    console.log(`✅ Created: ${event.title} (${event.slug})`);
  }

  return createdEvents;
}

async function seedRsvps(events: any[]) {
  console.log('📝 Seeding RSVPs...');

  // Random RSVPs distribution
  const rsvpData: { personId: string; eventId: string; status: string; checkedIn: boolean }[] = [];
  SAMPLE_USERS.forEach((personId) => {
    events.forEach((event, eventIndex) => {
      // 70% RSVP rate, varied status
      if (Math.random() > 0.3) {
        const status = eventIndex === 0 ? 'confirmed' : 
                      Math.random() > 0.7 ? 'waitlist' : 'confirmed';
        rsvpData.push({
          personId,
          eventId: event.id,
          status,
          checkedIn: Math.random() > 0.6,
        });
      }
    });
  });

  // Create RSVPs
  const createdRsvps = await prisma.eventRsvp.createMany({
    data: rsvpData,
    skipDuplicates: true,
  });

  // Update event RSVP counts
  for (const event of events) {
    const count = await prisma.eventRsvp.count({
      where: { eventId: event.id, status: 'confirmed' },
    });
    await prisma.event.update({
      where: { id: event.id },
      data: { rsvpCount: count },
    });
  }

  console.log(`✅ Created ${createdRsvps.count} RSVPs across ${events.length} events`);
  return createdRsvps;
}

async function main() {
  try {
    console.log('🚀 Starting events + RSVPs seeding...\n');

    // 1. Seed Events
    const events = await seedEvents();

    // 2. Seed RSVPs
    await seedRsvps(events);

    console.log('\n🎉 SEEDING COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log(`- ${events.length} Events created`);
    console.log(`- Check database for RSVP details`);

    // Optional: Query to verify
    const summary = await prisma.event.findMany({
      select: {
        title: true,
        slug: true,
        rsvpCount: true,
        startDateTime: true,
        type: true,
        status: true,
      },
      orderBy: { startDateTime: 'asc' },
    });

    console.table(summary.map(e => ({
      title: e.title,
      slug: e.slug,
      rsvps: e.rsvpCount,
      date: e.startDateTime.toLocaleString(),
      type: e.type,
    })));

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
