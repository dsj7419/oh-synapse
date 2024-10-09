// prisma/seed.ts
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
    typographyScale: '100%',
    smokeSpeed: 0.001,
    smokeOpacity: 0.3,
    saturationAdjust: 1,
    lightnessAdjust: 1,
    spotlightIntensity: 1.5,
    spotlightDistance: 1000,
    spotlightAngle: Math.PI / 6,
    spotlightPenumbra: 0,
    spotlightColor: "#ffffff",
    spotlightEnabled: true,
    webglLogoText: 'OHSynapse',
    webglLogoFontSize: 24,
    webglLogoFontFamily: 'Arial',
    webglLogoColor: '#ffffff',
    webglLogoAnimSpeed: 0.05,
    webglLogoInterRadius: 50,
    webglLargeText: JSON.stringify(['Welcome', 'to', 'OHSynapse']),
    webglLargeFontSize: 64,
    webglLargeFontFamily: 'Arial',
    webglLargeColor: '#ffffff',
    webglLargeAnimSpeed: 0.05,
    webglLargeInterRadius: 100,
    webglLargeChangeInterval: 5000,
  };

  // Upsert roles into the database
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Upsert the site theme into the database
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