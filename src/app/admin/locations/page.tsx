import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';

export default async function AdminLocations() {
  const session = await getAuthSession();
 
  if (!session) {
    redirect('/api/auth/signin');
  }
 
  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Location Management</h1>
      <p>Location management functionality will be implemented here.</p>
    </>
  );
}