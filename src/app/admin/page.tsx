import { getServerAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminDashboardContent from '@/components/AdminDashboardContent';

export default async function AdminHome() {
  const session = await getServerAuthSession();
 
  if (!session) {
    redirect('/api/auth/signin');
  }
 
  if (!session.user.roles.includes('admin')) {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboardContent />
    </>
  );
}