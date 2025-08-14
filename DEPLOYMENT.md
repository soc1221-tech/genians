# Vercel Deployment Guide for LeaveFlow

This guide will help you deploy LeaveFlow to Vercel with Supabase integration.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Supabase Setup

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose your organization and set project details

2. **Get Your Supabase Credentials**:
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key
   - Copy your `service_role` key (for server-side operations)
   - Go to Settings → Database and copy your `Connection string`

3. **Set up Database Schema**:
   ```bash
   npm run db:push
   ```

## Step 2: Vercel Deployment

1. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   In your Vercel project settings, add these environment variables:

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

3. **Deploy**:
   - Vercel will automatically detect the `vercel.json` configuration
   - Click "Deploy" and wait for the build to complete

## Step 3: Post-Deployment Setup

1. **Set up Database Tables**:
   After deployment, run the setup script:
   ```bash
   npm run setup:test-accounts
   ```

2. **Configure Supabase Auth**:
   - In Supabase Dashboard → Authentication → Settings
   - Add your Vercel domain to "Site URL"
   - Add your domain to "Redirect URLs"

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Test user authentication
3. Verify API endpoints are working
4. Check database connections

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding variables

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check Supabase project is active

3. **CORS Issues**:
   - Verify domain is added to Supabase settings
   - Check API routes are properly configured

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check Supabase Dashboard for database metrics
- Monitor API usage and errors

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys and secrets
- Enable Row Level Security (RLS) in Supabase
