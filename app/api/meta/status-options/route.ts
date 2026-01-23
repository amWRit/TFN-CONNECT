// API route to serve EduStatus and EmpStatus enums for frontend use
import { NextResponse } from 'next/server';

// If you have generated TypeScript enums, import them here
// For now, hardcode to match schema.prisma (add 'NA' as needed)
const EduStatus = [
  { value: 'NA', label: 'N/A' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'NOT_ENROLLED', label: 'Not Enrolled' },
];

const EmpStatus = [
  { value: 'NA', label: 'N/A' },
  { value: 'SEEKING', label: 'Seeking' },
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
];

export async function GET() {
  return NextResponse.json({
    eduStatus: EduStatus,
    empStatus: EmpStatus,
  });
}
