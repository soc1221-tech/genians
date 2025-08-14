# Quick Start Guide - Vercel Deployment

This guide will get you deployed to Vercel in under 10 minutes.

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)

## Step 1: Supabase Setup (5 minutes)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Set project name: `leaveflow`
   - Set database password (save this!)
   - Click "Create new project"

2. **Get Your Credentials**:
   - Go to Settings → API
   - Copy these values:
     - Project URL
     - anon public key
     - service_role key
   - Go to Settings → Database
   - Copy the connection string

## Step 2: Vercel Deployment (3 minutes)

1. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

2. **Configure Environment Variables**:
   In your Vercel project settings, add these variables:

   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SESSION_SECRET=your_random_32_character_string
   NODE_ENV=production
   ```

3. **Redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

## Step 3: Database Setup (2 minutes)

1. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

2. **Create Test Accounts**:
   ```bash
   npm run setup:test-accounts
   ```

## Step 4: Verify Deployment

1. **Test Health Endpoint**:
   Visit: `https://your-domain.vercel.app/api/health`
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Application**:
   Visit your Vercel URL and try logging in with:
   - Admin: `admin@leaveflow.com` / `admin123`
   - Employee: `employee@leaveflow.com` / `employee123`

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20.x)
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure database password is correct

### API Not Working
- Check `/api/health` endpoint
- Verify environment variables
- Check Vercel function logs

### Frontend Not Loading
- Verify client build completed
- Check `outputDirectory` in vercel.json
- Ensure static files are being served

## Next Steps

1. **Customize**: Update branding and colors
2. **Add Users**: Create real employee accounts
3. **Configure Slack**: Set up notifications
4. **Monitor**: Check Vercel analytics

## Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
- Review Vercel build logs for specific errors
- Verify all environment variables are correctly set 