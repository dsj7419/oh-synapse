import { getServerAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminRecipeList from '@/components/AdminRecipeList';

export default async function AdminRecipes() {
  const session = await getServerAuthSession();
 
  if (!session) {
    redirect('/api/auth/signin');
  }
 
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Recipe Management</h1>
      <AdminRecipeList />
    </>
  );
}