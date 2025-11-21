#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Prisma generate failed');
  process.exit(1);
}
