import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminRecipeList from '@/components/admin/recipes/AdminRecipeList.component';

export default async function AdminRecipes() {
  const session = await getAuthSession();
 
  if (!session) {
    redirect('/api/auth/signin');
  }
 
  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Recipe Management</h1>
      <AdminRecipeList />
    </>
  );
}