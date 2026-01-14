import React from "react";
import fs from "fs";
import path from "path";
import { marked } from "marked";

const iconMap: Record<string, string> = {
  "Acceptance of Terms": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5.26a2 2 0 0 0-1.11-1.79l-7-3.11a2 2 0 0 0-1.78 0l-7 3.11A2 2 0 0 0 4 5.26V12c0 6 8 10 8 10z"></path></svg>`,
  "User Conduct": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M4 21v-2a4 4 0 0 1 3-3.87"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  "Content Submission and Visibility": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><path d="M21 12a9 9 0 0 0-18 0"></path></svg>`,
  "Content Moderation": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1l1-4L16.5 3.5z"></path></svg>`,
  "Privacy": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  "Changes to Terms": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path></svg>`,
  "Contact": `<svg class="inline-block mr-2 align-middle" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3,7 12,13 21,7"></polyline></svg>`,
};

export default async function TermsPage() {
  // Read the markdown file from docs
  const filePath = path.join(process.cwd(), "docs", "TermsAndConditions.md");
  let markdown = "";
  try {
    markdown = fs.readFileSync(filePath, "utf-8");
  } catch {
    markdown = "Terms and Conditions document not found.";
  }
  // Convert markdown to HTML
  const html = await Promise.resolve(marked.parse(markdown));
  // Replace h2 headings with icon + heading
  let formattedHtml = html;
  Object.entries(iconMap).forEach(([heading, svg]) => {
    // Remove Tailwind color classes and add a visible color directly to SVG
    let color = '';
    if (svg.includes('text-blue-500')) color = '#2563eb';
    else if (svg.includes('text-green-500')) color = '#22c55e';
    else if (svg.includes('text-purple-500')) color = '#a21caf';
    else if (svg.includes('text-orange-500')) color = '#f97316';
    else if (svg.includes('text-gray-500')) color = '#6b7280';
    else if (svg.includes('text-pink-500')) color = '#ec4899';
    else if (svg.includes('text-blue-400')) color = '#60a5fa';
    const svgWithColor = svg.replace(/class="[^"]*text-[^"]*"/, `style='color:${color};stroke:${color};'`);
    const headingRegex = new RegExp(`<h2.*?>${heading}</h2>`, 'g');
    formattedHtml = formattedHtml.replace(
      headingRegex,
      `<div class='flex items-center gap-2 mt-6 mb-2'>${svgWithColor}<h2 class='text-xl font-semibold inline-block m-0'>${heading}</h2></div>`
    );
  });
  return (
    <div className="max-w-2xl mx-auto px-3 py-6 bg-white rounded-xl shadow border border-blue-100">
      <div
        className="prose prose-blue prose-base mx-auto"
        style={{
          lineHeight: '1.6',
          fontFamily: 'Inter, Arial, sans-serif',
          color: '#2d3748',
        }}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    </div>
  );
}
