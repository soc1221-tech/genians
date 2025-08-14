const { execSync } = require('child_process');

console.log('Building client...');

try {
  // Install dependencies
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the client
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Client build completed successfully!');
} catch (error) {
  console.error('Client build failed:', error);
  process.exit(1);
} 