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
   In your Vercel project settings, add these environment variables (see `vercel-env.example`):

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
   - The build process will install dependencies and build both client and server
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
3. Verify API endpoints are working (`/api/health`)
4. Check database connections

## Build Process

The Vercel build process follows these steps:
1. Install all dependencies (root, client, server)
2. Build the server TypeScript code
3. Build the client React application
4. Deploy the built client to Vercel's CDN
5. Set up API routes for serverless functions

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check Supabase project is active
   - Ensure database is accessible from Vercel's servers

3. **CORS Issues**:
   - Verify domain is added to Supabase settings
   - Check API routes are properly configured
   - Ensure CORS headers are set correctly

4. **Build Failures**:
   - Check Node.js version compatibility (20.x)
   - Verify all dependencies are installed
   - Check TypeScript compilation errors
   - Review build logs in Vercel dashboard

5. **API Routes Not Working**:
   - Verify `/api/index.js` exists and is properly configured
   - Check server build output in `server/dist/`
   - Ensure Express app is properly exported

6. **Static Files Not Serving**:
   - Verify `client/dist` directory is built correctly
   - Check `outputDirectory` in `vercel.json`
   - Ensure client build completes successfully

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check Supabase Dashboard for database metrics
- Monitor API usage and errors
- Review Vercel function logs for debugging

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys and secrets
- Enable Row Level Security (RLS) in Supabase
- Use Vercel's environment variable encryption

## Performance Optimization

- Enable Vercel's Edge Functions for better performance
- Use Supabase's connection pooling
- Implement proper caching strategies
- Monitor and optimize database queries
