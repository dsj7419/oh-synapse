import { getAuthSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import StatsDisplay from '@/components/admin/stats/StatsDisplay';

const AdminStatsPage = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect('/api/auth/signin');
  }

  if (!session.user.roles.some((role) => ['admin'].includes(role))) {
    redirect('/');
  }

  return (
    <>
      <StatsDisplay />
    </>
  );
};

export default AdminStatsPage;
