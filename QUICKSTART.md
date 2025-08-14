# 🚀 LeaveFlow Quick Start Guide

Get LeaveFlow up and running in minutes with Supabase!

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd LeaveFlow
npm run install:all
```

### 2. Set Up Supabase
```bash
# Create a Supabase project at https://supabase.com
# Copy env.example to .env and update with your Supabase credentials
cp env.example .env
# Edit .env with your Supabase credentials
```

### 3. Set Up Database Schema
```bash
npm run db:push
```

### 4. Create Test Accounts
```bash
npm run setup:test-accounts
```

### 5. Start Development
```bash
npm run dev
```

### 6. Open in Browser
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔑 Test Accounts

**Admin**: `admin@leaveflow.com` / `admin123`
**Employee**: `employee@leaveflow.com` / `employee123`

## 🌐 Deploy to Vercel

### Option 1: Use Deploy Script
```bash
./deploy.sh
```

### Option 2: Manual Deployment
```bash
npm run build
vercel --prod
```

## 📱 What You Can Do

### As Admin:
- View all employees
- Monitor leave statistics
- Approve/reject requests
- Manage team

### As Employee:
- Submit leave requests
- View personal history
- Check leave balance
- Update profile

## 🗄️ Supabase Setup

For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

### Quick Supabase Steps:
1. **Sign up** at [supabase.com](https://supabase.com)
2. **Create project** and get credentials
3. **Update `.env`** with your Supabase details
4. **Run schema setup**: `npm run db:push`

## 🆘 Need Help?

1. Check the console for errors
2. Verify your `.env` file is set up with Supabase credentials
3. Ensure your Supabase database is accessible
4. Check the full README.md for detailed instructions
5. Refer to SUPABASE_SETUP.md for database-specific issues

## 🎯 Next Steps

- Customize the UI theme
- Add your company logo
- Configure Slack notifications
- Set up email notifications
- Add more features!

---

**Happy Leave Management! 🎉** 