import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, body, images, bodyTab } = await req.json();
    // TODO: Render email HTML based on bodyTab (visual, markdown, html)
    // For now, just return body as HTML
    let html = body;
    // If markdown, convert to HTML
    if (bodyTab === 'markdown') {
      const { marked } = await import('marked');
      marked.setOptions({
        gfm: true,
        breaks: true
      });
      html = marked.parse(body || '');
    }
    // If visual, TODO: handle unlayer template
    // Images: embed as <img src="..." />
    if (images && Array.isArray(images)) {
      html += images.map((src: string) => `<img src="${src}" style="max-width:200px;margin:8px;" />`).join('');
    }
    // Add subject as header and inject minimal markdown styles for preview
    const style = `
      <style>
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; }
        th { background: #f7fafc; }
        code, pre { background: #f3f3f3; color: #222; border-radius: 4px; padding: 2px 6px; font-family: monospace; }
        pre { padding: 10px; overflow-x: auto; }
        ul { margin-left: 1.5em; list-style-type: disc; }
        ol { margin-left: 1.5em; list-style-type: decimal; }
        ul ul, ol ul { list-style-type: circle; }
        ol ol, ul ol { list-style-type: lower-alpha; }
        li { margin-bottom: 0.25em; }
        blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #555; background: #f9f9f9; }
        del { color: #b91c1c; }
        input[type=\"checkbox\"] { margin-right: 0.5em; }
      </style>
    `;
    html = style + `<h2>${subject}</h2>` + html;
    return NextResponse.json({ html });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : 'Preview error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
