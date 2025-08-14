#!/bin/bash

echo "🚀 LeaveFlow Vercel Deployment Script"
echo "====================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Vercel CLI found"
echo "✅ Project configuration found"

# Check if environment variables are set
echo ""
echo "🔍 Checking environment variables..."

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "SESSION_SECRET"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables in your Vercel project settings."
    exit 1
fi

echo "✅ All required environment variables are set"

# Build the project locally to check for errors
echo ""
echo "🔨 Building project locally..."

if npm run build; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed. Please fix the errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."

if vercel --prod; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔍 Next steps:"
    echo "1. Check your Vercel dashboard for the deployment URL"
    echo "2. Test the health endpoint: https://your-domain.vercel.app/api/health"
    echo "3. Verify the application is working correctly"
    echo "4. Set up your domain in Supabase authentication settings"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 