import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, body, recipients, cc, images } = await req.json();
    // TODO: Send email via Apps Script webhook
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const response = await fetch(appsScriptUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, htmlBody: body, recipients, cc, images }),
    });
    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Send error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
