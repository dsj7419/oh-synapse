import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import AdminRecipeList from '@/components/admin/recipes/AdminRecipeList.component';
import { Box, Heading } from '@radix-ui/themes';

export default async function AdminRecipes() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/api/auth/signin');
  }

  if (!session.user.roles.some(role => ['admin', 'editor'].includes(role))) {
    redirect('/');
  }

  return (
    <Box>
      <AdminRecipeList />
    </Box>
  );
}