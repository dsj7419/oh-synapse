import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import UserManagementContent from '@/components/admin/users/UserManagementContent.component';
import { Card, Heading } from '@radix-ui/themes';

export default async function AdminUsers() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/api/auth/signin');
  }
  if (!session.user.roles?.some(role => ['admin', 'moderator', 'editor', 'content_creator'].includes(role))) {
    redirect('/');
  }

  return (
    <Card size="3">
      <Heading size="6" mb="4">User Management</Heading>
      <UserManagementContent />
    </Card>
  );
}