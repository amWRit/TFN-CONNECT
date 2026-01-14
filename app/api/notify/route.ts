import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { SubscriptionType } from '@prisma/client';

const LOGO_URL = "https://tfn-connect.vercel.app/logo.png";

const TYPE_CONFIG = {
  EVENT: {
    model: 'event',
    subject: (item: any) => `[TFN] New Event: ${item.title}`,
    html: (item: any, appUrl: string) => {
      const startDate = item.startDateTime ? new Date(item.startDateTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';
      const externalLink = item.externalLink ? `<div style=\"margin:12px 0;\"><a href=\"${item.externalLink}\" style=\"color:#1565c0;text-decoration:underline;font-weight:bold;\">External Link</a></div>` : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          <h2 style='color:#1a237e;'>${item.title}</h2>
          <div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>When:</b> ${startDate}</div>
          ${externalLink}
          <p>${item.description || ''}</p>
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
    subject: (item: any) => `[TFN] New Job Posting: ${item.title}`,
    html: (item: any, appUrl: string) => {
    const jobType: string = item.jobType
      ? `<div style=\"color:#333;font-size:15px;margin-bottom:4px;\"><b>Type:</b> ${item.jobType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>`
      : '';
      const deadline = item.deadline ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Deadline:</b> ${new Date(item.deadline).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>` : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          <h2 style='color:#1a237e;'>${item.title}</h2>
          ${jobType}
          ${deadline}
          <p>${item.description || ''}</p>
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
    subject: (item: any) => `[TFN] New Opportunity: ${item.title}`,
    html: (item: any, appUrl: string) => {
      const types = Array.isArray(item.types) && item.types.length
        ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Types:</b> ${item.types.map((t: string) => t.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ')}</div>`
        : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          <h2 style='color:#1a237e;'>${item.title}</h2>
          ${types}
          <p>${item.description || ''}</p>
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
    subject: (item: any) => `[TFN] New Post: ${item.title}`,
    html: (item: any, appUrl: string) => {
      const postType = item.postType
        ? `<div style=\"color:#333;font-size:15px;margin-bottom:8px;\"><b>Type:</b> ${item.postType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>`
        : '';
      return `
        <div style=\"font-family:sans-serif;max-width:600px;margin:auto;\">
          <img src='${LOGO_URL}' alt='TFN Logo' style='height:48px;margin-bottom:16px;'>
          <h2 style='color:#1a237e;'>${item.title}</h2>
          ${postType}
          <p>${item.content || ''}</p>
          <a href=\"${appUrl}/feed/${item.id}\" style=\"display:inline-block;padding:10px 20px;background:#1a237e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;\">View Details</a>
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
    const { type, id, personTypes, which } = await req.json();
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
        item = await prisma.post.findUnique({ where: { id } });
        break;
      default:
        item = null;
    }
    if (!item) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }

    // Require personTypes to be a non-empty array
    if (!Array.isArray(personTypes) || personTypes.length === 0) {
      return NextResponse.json({ error: 'personTypes must be a non-empty array' }, { status: 400 });
    }
    const allowedTypes: import('@prisma/client').PersonType[] = personTypes;
    // Use which field to select email1 or email2
    const emailField = which === 'email2' ? 'email2' : 'email1';

    // Find subscribers with matching subscription and allowed person types
    const subscribers = await prisma.person.findMany({
      where: {
        subscriptions: { has: type as SubscriptionType },
        [emailField]: { not: '' },
        type: { in: allowedTypes },
      },
      select: { email1: true, email2: true, firstName: true, lastName: true, type: true },
    });

    // Filter out missing emails
    const filteredSubscribers = subscribers.filter(s => s[emailField]);
    if (!filteredSubscribers.length) {
      return NextResponse.json({ success: true, count: 0, message: 'No subscribers found' });
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || '';
    const subject = TYPE_CONFIG[type as TypeConfigKey].subject(item);
    const htmlBody = TYPE_CONFIG[type as TypeConfigKey].html(item, appUrl);

    // Send to Apps Script
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const response = await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        htmlBody,
        subscribers: filteredSubscribers.map(s => ({ email: s[emailField], name: `${s.firstName} ${s.lastName}` })),
      }),
    });
    const result = await response.json();

    return NextResponse.json({ success: true, count: filteredSubscribers.length, appsScript: result });
  } catch (error: any) {
    // Log error details to server console for debugging
    console.error('Notify API error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
