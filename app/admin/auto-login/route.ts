import { redirect } from 'next/navigation';

export function GET() {
  // This route will be called to auto-login
  // The actual auth happens on the client side via redirect
  redirect('/admin/home?auto=true');
}
