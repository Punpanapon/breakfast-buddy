# Breakfast Buddy 🍳

A production-ready web app that helps students in Bangkok never skip breakfast again. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Daily Logging**: One-tap "Eat" or "Skip" breakfast logging
- **Meal Database**: Searchable breakfast options with macro tracking
- **Streak Gamification**: Track consecutive breakfast days with badges
- **Smart Reminders**: PWA notifications during breakfast window
- **History Tracking**: View last 14 days of breakfast logs
- **Device Integration**: ESP32 API endpoint for mood display
- **Bangkok Timezone**: All dates/times in Asia/Bangkok timezone

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the schema in Supabase SQL Editor:
   ```sql
   -- Copy and paste contents of supabase/schema.sql
   ```
3. Enable Row Level Security on all tables
4. Update `.env.local` with your Supabase URL and anon key

### 4. Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Type checking
npm run typecheck

# Seed meals (after Supabase setup)
npm run seed
```

## Supabase Schema Summary

### Tables
- **profiles**: User settings (breakfast window, display name)
- **meals**: Breakfast options with macros and tags
- **logs**: Daily breakfast logs (one per user per day)

### RLS Policies
- **meals**: Public read access
- **logs**: Users can only access their own logs
- **profiles**: Users can only access their own profile

## API Endpoints

### Device Status
```
GET /api/device-status?uid=<user_id>&token=<token>
```

Returns mood for ESP32 display:
- `happy`: Ate today AND streak ≥ 3
- `neutral`: Ate today but streak < 3  
- `angry`: Missed ≥ 2 of last 3 days OR after 10:30 with no log

## PWA Features

- Installable as mobile app
- Breakfast reminder notifications
- Offline-ready (basic functionality)
- Bangkok timezone awareness

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── meals/          # Meals listing page
│   ├── history/        # 14-day history
│   ├── streak/         # Streak & badges
│   └── settings/       # User preferences
├── components/         # Reusable UI components
├── lib/               # Utilities and clients
│   ├── supabase.ts    # Supabase client
│   ├── types.ts       # TypeScript definitions
│   ├── time.ts        # Bangkok timezone utilities
│   └── streak.ts      # Streak computation
└── styles/            # Global styles
```

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Start production server

# Quality
npm run lint            # ESLint
npm run typecheck       # TypeScript check
npm run test            # Run Vitest tests

# Data
npm run seed            # Seed meals database
```

## Troubleshooting

### Authentication Issues
- Verify Supabase URL and anon key in `.env.local`
- Check email provider settings in Supabase Auth

### Timezone Issues
- All dates use Asia/Bangkok timezone
- Server and client should show consistent times

### Notification Issues
- HTTPS required for notifications in production
- Check browser notification permissions

### Database Issues
- Ensure RLS is enabled on all tables
- Verify policies allow user access to own data

## Production Deployment

1. Set environment variables on your hosting platform
2. Ensure HTTPS is enabled for PWA features
3. Configure Supabase Auth redirect URLs
4. Test device API endpoint with actual ESP32

## License

MIT License - see LICENSE file for details