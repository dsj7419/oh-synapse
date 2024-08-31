import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userEmail = 'globalaspect1@gmail.com'

  // Define the roles you need to ensure exist
  const rolesToEnsure = [
    { name: 'admin', description: 'Full access to all features' },
    { name: 'moderator', description: 'Can manage user-generated content' },
    { name: 'editor', description: 'Can edit and publish content' },
    { name: 'content_creator', description: 'Can create and manage their own content' },
    { name: 'viewer', description: 'Default role for all users' },
  ];

  // Ensure all roles exist in the database
  const rolePromises = rolesToEnsure.map(role =>
    prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name, description: role.description },
    })
  );

  const roles = await Promise.all(rolePromises);

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    throw new Error('User not found');
  }

  // Get the user's current roles
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  // Filter out the roles that the user already has
  const rolesToAssign = roles.filter(role => 
    !userRoles.some(userRole => userRole.role.name === role.name)
  );

  // Assign the missing roles to the user
  const assignRolePromises = rolesToAssign.map(role =>
    prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    })
  );

  await Promise.all(assignRolePromises);

  console.log(`Roles assigned to user with email ${userEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
