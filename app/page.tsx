import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Always redirect to sign-in
  // Middleware will handle redirecting authenticated users to dashboard
  redirect('/sign-in');
}
