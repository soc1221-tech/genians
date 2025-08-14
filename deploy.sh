#!/bin/bash

echo "🚀 Deploying LeaveFlow to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building the project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in the Vercel dashboard"
echo "2. Configure your PostgreSQL database"
echo "3. Run the test account setup: npm run setup:test-accounts"
echo ""
echo "🔑 Test accounts will be available after setup:"
echo "Admin: admin@leaveflow.com / admin123"
echo "Employee: employee@leaveflow.com / employee123" 