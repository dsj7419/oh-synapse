import { getServerAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import BonusStatTabs from '@/components/admin/bonus-stats/BonusStatTabs.component';

export default async function AdminBonusStats() {
  const session = await getServerAuthSession();
 
  if (!session) {
    redirect('/api/auth/signin');
  }
 
  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Bonus Stat Management</h1>
      <BonusStatTabs />
    </>
  );
}