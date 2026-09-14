const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { userRoles: true },
  });
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(u.id, u.email, u.name, u.userRoles.map(r => r.role));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
