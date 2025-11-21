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
  console.log('Attempt 1: Running from project root cwd:', process.cwd());
  try {
    console.log('Running:', cmd, 'with cwd:', process.cwd());
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (firstErr) {
    console.warn('Attempt 1 failed, will try from schema directory. Error message:', firstErr && firstErr.message);
    try {
      console.log('Attempt 2: Running:', cmd, 'with cwd:', schemaDir);
      execSync(cmd, { stdio: 'inherit', cwd: schemaDir });
    } catch (secondErr) {
      console.error('Both attempts to run `prisma generate` failed.');
      if (firstErr) {
        console.error('First attempt (root) error:', firstErr && firstErr.message);
        if (firstErr.stdout) console.error('stdout:', firstErr.stdout.toString());
        if (firstErr.stderr) console.error('stderr:', firstErr.stderr.toString());
      }
      if (secondErr) {
        console.error('Second attempt (schema dir) error:', secondErr && secondErr.message);
        if (secondErr.stdout) console.error('stdout:', secondErr.stdout.toString());
        if (secondErr.stderr) console.error('stderr:', secondErr.stderr.toString());
      }
      throw secondErr || firstErr;
    }
  }
  process.exit(0);
} catch (err) {
  console.error('Failed to generate Prisma client:', err && err.message ? err.message : err);
  process.exit(1);
}
