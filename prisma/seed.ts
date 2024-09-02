import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const roles = [
    { name: 'admin', description: 'Full access to all features' },
    { name: 'editor', description: 'Can add/edit content such as recipes, farming information, and weapon builds' },
    { name: 'moderator', description: 'Can manage user content, including banning or resetting users' },
    { name: 'content_manager', description: 'Oversees all content-related tasks' },
    { name: 'viewer', description: 'General users who can browse the main pages' },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  console.log('Roles seeded successfully')

  // Create admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
  if (adminRole) {
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        // Note: In a real application, use a secure method to set the password
        // and store it securely (e.g., hashed)
        // For this example, we're using a plain text password, which is not recommended for production
        roles: {
          create: {
            role: { connect: { id: adminRole.id } }
          }
        }
      },
    })
    console.log('Admin user created:', adminUser)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })