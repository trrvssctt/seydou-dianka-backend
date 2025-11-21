require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: node scripts/createAdmin.js <email> <password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password_hash: hash, role: 'admin', full_name: 'Admin' } });
  console.log('Created admin user', user.id);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
