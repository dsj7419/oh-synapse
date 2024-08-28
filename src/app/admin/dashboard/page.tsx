import { getServerAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminDashboardContent from '@/components/AdminDashboardContent';

export default async function AdminDashboard() {
  const session = await getServerAuthSession();
  console.log("AdminDashboard - Session:", session);

  if (!session) {
    console.log("AdminDashboard - No session, redirecting to login");
    redirect('/api/auth/signin');
  }

  if (session.user.role !== 'admin') {
    console.log("AdminDashboard - Non-admin user, redirecting to home");
    redirect('/');
  }

  return <AdminDashboardContent />;
}