import { getServerAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import BonusStatManagement from '@/components/BonusStatManagement';

export default async function AdminBonusStats() {
  const session = await getServerAuthSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Bonus Stat Management</h1>
      <BonusStatManagement />
    </>
  );
}