import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'admin', description: 'Full access to all features' },
    { name: 'editor', description: 'Can add/edit content such as recipes, farming information, and weapon builds' },
    { name: 'moderator', description: 'Can manage user content, including banning or resetting users' },
    { name: 'content_manager', description: 'Oversees all content-related tasks' },
    { name: 'viewer', description: 'General users who can browse the main pages' },
  ];

  const theme = {
    name: 'Light',
    primaryColor: '#000000',
    accentColor: 'indigo',
    grayColor: 'gray',
    font: 'Arial',
    layout: 'Grid',
    radius: 'small',
    scaling: '100%',
    panelBackground: 'solid',
    appearance: 'light',
  };

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  await prisma.siteTheme.upsert({
    where: { id: 'site_theme_id' },
    update: theme,
    create: { ...theme, id: 'site_theme_id' },
  });

  console.log('Roles and Theme seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect()
      .then(() => console.log('Disconnected from database'))
      .catch((disconnectError) => console.error('Error disconnecting:', disconnectError));
  });
