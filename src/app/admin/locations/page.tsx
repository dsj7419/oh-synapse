import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminLocationsPage from '@/components/admin/locations/AdminLocationsPage.component';

export default async function AdminLocations() {

  const session = await getAuthSession();
  

  if (!session) {
    redirect('/api/auth/signin');
  }


  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return <AdminLocationsPage />;
}
