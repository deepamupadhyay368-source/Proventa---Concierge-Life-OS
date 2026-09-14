const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const founderEmails = ['deepamupadhyay368@gmail.com', 'proventa.in@gmail.com', 'admin@proventa.dev'];
  
  for (const email of founderEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: true },
    });
    
    if (user) {
      console.log(`Setting SUPER_ADMIN for ${email}...`);
      await prisma.userRoleAssignment.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: 'SUPER_ADMIN',
          },
        },
        update: {},
        create: {
          userId: user.id,
          role: 'SUPER_ADMIN',
          grantedBy: 'SYSTEM_BOOTSTRAP',
        },
      });
      console.log(`✓ Granted SUPER_ADMIN to ${email} (${user.name || 'Founder'})`);
    }
  }

  console.log('Founder bootstrap complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
