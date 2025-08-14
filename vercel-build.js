import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Starting Vercel build process...');

try {
  // Install all dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm run install:all', { stdio: 'inherit' });

  // Build the server first
  console.log('🔨 Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });

  // Build the client
  console.log('🎨 Building client...');
  execSync('npm run build:client', { stdio: 'inherit' });

  console.log('✅ Vercel build completed successfully!');
} catch (error) {
  console.error('❌ Vercel build failed:', error);
  process.exit(1);
} 