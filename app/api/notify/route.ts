

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { SubscriptionType } from '@prisma/client';
import { marked } from 'marked';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const LOGO_URL = "https://tfn-connect.vercel.app/logos/logo.png";

const TYPE_CONFIG = {
  EVENT: {
    model: 'event',
    subject: (item: any) => `[TFN Connect] Event: ${item.title}`,
    html: (item: any, appUrl: string, subscriber?: { firstName?: string }) => {
      const startDate = item.startDateTime ? new Date(item.startDateTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';
      const externalLink = item.externalLink ? `<div style=\"margin:12px 0;\"><a href=\"${item.externalLink}\" style=\"color:#1565c0;text-decoration:underline;font-weight:bold;\">External Link</a></div>` : '';
      const overviewHtml = item.overview ? `<b>Overview:</b><br>` + marked.parse(item.overview) : '';
      const greeting = subscriber?.firstName ? `<p style='margin-bottom:0;'>Dear ${subscriber.firstName},</p>\n<p style='margin-bottom:16px;'>Here is an event you might be interested in.</p>` : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          ${greeting}
          <h2 style='color:#1a237e;'>${item.title}</h2>
          <div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>When:</b> ${startDate}</div>
          ${externalLink}
          <div>${overviewHtml}</div>
          <a href=\"${appUrl}/events/${item.id}\" style=\"display:inline-block;padding:10px 20px;background:#1a237e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;\">View Details</a>
          <hr style=\"margin:24px 0;\">
          <p style=\"font-size:13px;color:#888;\">You are receiving this because you subscribed to <b>Events</b> notifications.<br>
          <a href=\"${appUrl}/profile/settings\">Update your notification preferences</a></p>
        </div>
      `;
    },
  },
  JOB_POSTING: {
    model: 'jobPosting',
    subject: (item: any) => `[TFN Connect] Job: ${item.title}`,
    html: (item: any, appUrl: string, subscriber?: { firstName?: string }) => {
      const jobType: string = item.jobType
        ? `<div style=\"color:#333;font-size:15px;margin-bottom:4px;\"><b>Type:</b> ${item.jobType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>`
        : '';
      const deadline = item.deadline ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Deadline:</b> ${new Date(item.deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>` : '';
      const overviewHtml = item.overview ? `<b>Overview:</b><br>` + marked.parse(item.overview) : '';
      const greeting = subscriber?.firstName ? `<p style='margin-bottom:0;'>Dear ${subscriber.firstName},</p>\n<p style='margin-bottom:16px;'>Here is a job posting you might be interested in.</p>` : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          ${greeting}
          <h2 style='color:#1a237e;'>${item.title}</h2>
          ${jobType}
          ${deadline}
          <div>${overviewHtml}</div>
          <a href=\"${appUrl}/jobs/${item.id}\" style=\"display:inline-block;padding:10px 20px;background:#1a237e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;\">View Details</a>
          <hr style=\"margin:24px 0;\">
          <p style=\"font-size:13px;color:#888;\">You are receiving this because you subscribed to <b>Job Postings</b> notifications.<br>
          <a href=\"${appUrl}/profile/settings\">Update your notification preferences</a></p>
        </div>
      `;
    },
  },
  OPPORTUNITY: {
    model: 'opportunity',
    subject: (item: any) => `[TFN Connect] Opportunity: ${item.title}`,
    html: (item: any, appUrl: string, subscriber?: { firstName?: string }) => {
      const types = Array.isArray(item.types) && item.types.length
        ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Types:</b> ${item.types.map((t: string) => t.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ')}</div>`
        : '';
      const overviewHtml = item.overview ? `<b>Overview:</b><br>` + marked.parse(item.overview) : '';
      const greeting = subscriber?.firstName ? `<p style='margin-bottom:0;'>Dear ${subscriber.firstName},</p>\n<p style='margin-bottom:16px;'>Here is an opportunity you might be interested in.</p>` : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          ${greeting}
          <h2 style='color:#1a237e;'>${item.title}</h2>
          ${types}
          <div>${overviewHtml}</div>
          <a href=\"${appUrl}/opportunities/${item.id}\" style=\"display:inline-block;padding:10px 20px;background:#1a237e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;\">View Details</a>
          <hr style=\"margin:24px 0;\">
          <p style=\"font-size:13px;color:#888;\">You are receiving this because you subscribed to <b>Opportunities</b> notifications.<br>
          <a href=\"${appUrl}/profile/settings\">Update your notification preferences</a></p>
        </div>
      `;
    },
  },
  POST: {
    model: 'post',
    subject: (item: any) => {
      // Use a preview of content for subject, fallback to id
      const preview = item.content ? item.content.slice(0, 40).replace(/\n/g, ' ') + (item.content.length > 40 ? '...' : '') : item.id;
      return `[TFN Connect] Post: ${preview}`;
    },
    html: (item: any, appUrl: string, subscriber?: { firstName?: string }) => {
      const postType = item.postType
        ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Type:</b> ${item.postType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>`
        : '';
      // Always show postedBy, fallback to 'Unknown'
      const postedBy = `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Posted by:</b> ${[item.person?.firstName, item.person?.lastName].filter(Boolean).join(' ') || 'Unknown'}</div>`;
      const greeting = subscriber?.firstName
        ? `<p style='margin-bottom:0;'>Hi ${subscriber.firstName},</p>\n<p style='margin-bottom:16px;'>You have a post update from TFN Connect:</p>`
        : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          ${greeting}
          ${postedBy}
          ${postType}
          <div style=\"margin-bottom:12px;\">${item.content || ''}</div>
          <a href=\"${appUrl}/feed\" style=\"display:inline-block;padding:10px 20px;background:#1a237e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;\">Go to Feed</a>
          <hr style=\"margin:24px 0;\">
          <p style=\"font-size:13px;color:#888;\">You are receiving this because you subscribed to <b>Posts</b> notifications.<br>
          <a href=\"${appUrl}/profile/settings\">Update your notification preferences</a></p>
        </div>
      `;
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { type, id, personTypes, which, test, adminauth } = await req.json();
    console.log('Notify API called with:', { type, id, personTypes, which, test });
    type TypeConfigKey = keyof typeof TYPE_CONFIG;
    if (!type || !id || !(type in TYPE_CONFIG)) {
      return NextResponse.json({ error: 'Missing or invalid type/id' }, { status: 400 });
    }

    // Map type to Prisma delegate
    let item: any = null;
    switch (type) {
      case 'EVENT':
        item = await prisma.event.findUnique({ where: { id } });
        break;
      case 'JOB_POSTING':
        item = await prisma.jobPosting.findUnique({ where: { id } });
        break;
      case 'OPPORTUNITY':
        item = await prisma.opportunity.findUnique({ where: { id } });
        break;
      case 'POST':
        item = await prisma.post.findUnique({
          where: { id },
          include: { person: { select: { firstName: true, lastName: true } } },
        });
        break;
      default:
        item = null;
    }
    console.log('Notify API item:', item);
    if (!item) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }


    let filteredSubscribers;
    let emailField = which === 'email2' ? 'email2' : 'email1';
    if (test) {
      // Only send to current user
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Find the person by email
      const person = await prisma.person.findUnique({ where: { email1: session.user.email }, select: { email1: true, email2: true, firstName: true, lastName: true, type: true } });
      if (
        !person ||
        !(person as { email1: string; email2: string | null })[emailField as 'email1' | 'email2']
      ) {
        return NextResponse.json({ success: false, message: 'No email found for current user' });
      }
      filteredSubscribers = [person];
      console.log('Notify API test mode, filteredSubscribers:', filteredSubscribers);
    } else {
      // Require personTypes to be a non-empty array
      if (!Array.isArray(personTypes) || personTypes.length === 0) {
        return NextResponse.json({ error: 'personTypes must be a non-empty array' }, { status: 400 });
      }
      const allowedTypes: import('@prisma/client').PersonType[] = personTypes;
      let subscribers;
      if (adminauth) {
        // Admin override: send to all matching person types, ignore subscriptions
        subscribers = await prisma.person.findMany({
          where: {
            [emailField]: { not: '' },
            type: { in: allowedTypes },
          },
          select: { email1: true, email2: true, firstName: true, lastName: true, type: true },
        });
      } else {
        // Default: require subscription
        subscribers = await prisma.person.findMany({
          where: {
            subscriptions: { has: type as SubscriptionType },
            [emailField]: { not: '' },
            type: { in: allowedTypes },
          },
          select: { email1: true, email2: true, firstName: true, lastName: true, type: true },
        });
      }
      // Filter out missing emails
      filteredSubscribers = subscribers.filter(s => (s as Record<string, string | null>)[emailField]);
      console.log('Notify API filteredSubscribers:', filteredSubscribers);
      if (!filteredSubscribers.length) {
        return NextResponse.json({ success: true, count: 0, message: 'No subscribers found' });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || '';
    const subject = TYPE_CONFIG[type as TypeConfigKey].subject(item);
    // Add personalized greeting for all types
    const firstName = filteredSubscribers[0]?.firstName;
    const htmlBody = TYPE_CONFIG[type as TypeConfigKey].html(item, appUrl, { firstName });

    // Send to Apps Script in batches of 50
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const BATCH_SIZE = 50;
    const batches = [];
    for (let i = 0; i < filteredSubscribers.length; i += BATCH_SIZE) {
      batches.push(filteredSubscribers.slice(i, i + BATCH_SIZE));
    }
    let totalSent = 0;
    let batchResults = [];
    let sentEmails: string[] = [];
    for (const batch of batches) {
      console.log('Notify API sending batch:', batch.map(s => ({ email: (s as Record<string, string | null>)[emailField], name: `${s.firstName} ${s.lastName}` })));
      const response = await fetch(appsScriptUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlBody,
          subscribers: batch.map(s => ({ email: (s as Record<string, string | null>)[emailField], name: `${s.firstName} ${s.lastName}` })),
        }),
      });
      const result = await response.json();
      batchResults.push(result);
      totalSent += batch.length;
      // Collect sent emails for CSV
      sentEmails.push(...batch.map(s => (s as Record<string, string | null>)[emailField]).filter((email): email is string => typeof email === 'string' && email !== null));
    }

    return NextResponse.json({ success: true, count: totalSent, batches: batchResults, sentEmails });
  } catch (error: any) {
    // Log error details to server console for debugging
    console.error('Notify API error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
