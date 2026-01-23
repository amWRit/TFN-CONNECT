// import { redirect } from 'next/navigation';

export function GET() {
  // Auto-login feature is currently disabled. To re-enable, uncomment the code below.
  // This route will be called to auto-login
  // The actual auth happens on the client side via redirect
  // redirect('/admin/home?auto=true');
  return new Response('Admin auto-login is disabled.', { status: 410 });
}
