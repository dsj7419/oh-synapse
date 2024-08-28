import { getServerAuthSession } from "@/server/auth";
import BonusStatManagement from '@/components/BonusStatManagement';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerAuthSession();
  console.log("AdminPage - Session:", session);

  if (!session) {
    console.log("AdminPage - No session, redirecting to login");
    redirect('/api/auth/signin');
  }

  if (session.user.role !== 'admin') {
    console.log("AdminPage - Non-admin user, redirecting to home");
    redirect('/');
  }

  return <BonusStatManagement />;
}