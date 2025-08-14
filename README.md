# LeaveFlow

A modern leave management system built with React, TypeScript, Express, and Supabase.

## Features

- **User Authentication**: Secure login system with role-based access
- **Leave Request Management**: Submit, approve, and track leave requests
- **Admin Dashboard**: Comprehensive admin interface for managing employees and requests
- **Real-time Notifications**: Slack integration for leave request notifications
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Database Integration**: PostgreSQL database with Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Passport.js with local strategy
- **Deployment**: Vercel (Frontend + API)

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd LeaveFlow
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory (see `vercel-env.example` for reference):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_database_url
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database**:
   ```bash
   npm run db:push
   ```

5. **Create test accounts**:
   ```bash
   npm run setup:test-accounts
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

   This will start both the client (port 5173) and server (port 3001).

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run setup:test-accounts` - Create test user accounts

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick deployment steps**:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Required environment variables for deployment:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Client-side Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Session Configuration
SESSION_SECRET=your_random_32_character_string

# Environment
NODE_ENV=production
```

## Project Structure

```
LeaveFlow/
├── api/                 # Vercel serverless functions
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility libraries
├── server/              # Express backend
│   ├── dist/            # Built server files
│   └── src/             # Server source code
├── shared/              # Shared schemas and types
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/admin/employees` - Get all employees (admin only)
- `POST /api/leave/request` - Submit leave request
- `GET /api/leave/mine` - Get user's leave requests
- `GET /api/leave/all` - Get all leave requests (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting guide.
