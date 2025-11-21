#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findSchema(startDir, maxDepth = 6) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < maxDepth; i++) {
    const candidate = path.join(dir, 'prisma', 'schema.prisma');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

try {
  const start = __dirname; // server/scripts
  const schema = findSchema(start, 8) || findSchema(process.cwd(), 8);
  if (!schema) {
    console.error('Prisma schema not found. Searched relative to', start, 'and', process.cwd());
    process.exit(1);
  }

  console.log('Found Prisma schema at', schema);
  console.log('Running: npx prisma generate --schema=' + schema);
  execSync(`npx prisma generate --schema="${schema}"`, { stdio: 'inherit' });
  process.exit(0);
} catch (err) {
  console.error('Failed to generate Prisma client:', err);
  process.exit(1);
}
