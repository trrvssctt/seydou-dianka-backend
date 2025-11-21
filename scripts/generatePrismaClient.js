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
  const schemaDir = path.dirname(schema);
  console.log('Found Prisma schema at', schema);
  console.log('Schema directory:', schemaDir);
  console.log('Current working directory:', process.cwd());
  try {
    console.log('Prisma CLI version:');
    execSync('npx prisma --version', { stdio: 'inherit', cwd: schemaDir });
  } catch (verErr) {
    console.warn('Could not run `npx prisma --version`:', verErr && verErr.message);
  }

  const cmd = `npx prisma generate --schema="${schema}"`;
  console.log('Running:', cmd, 'with cwd:', schemaDir);
  execSync(cmd, { stdio: 'inherit', cwd: schemaDir });
  process.exit(0);
} catch (err) {
  console.error('Failed to generate Prisma client:', err && err.message ? err.message : err);
  process.exit(1);
}
