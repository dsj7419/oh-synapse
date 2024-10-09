import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import RssSettingsContent from '@/components/admin/rss-settings/RssSettingsContent';
import { Card, Heading } from '@radix-ui/themes';

export default async function AdminRssSettings() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/api/auth/signin');
  }
  if (!session.user.roles?.some(role => ['admin', 'content_creator'].includes(role))) {
    redirect('/');
  }

  return (
    <Card size="3">
      <Heading size="6" mb="4">RSS Feed Settings</Heading>
      <RssSettingsContent />
    </Card>
  );
}