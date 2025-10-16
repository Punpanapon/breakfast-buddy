# Breakfast RPG Setup Guide

## Running Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run the RPG migration:
```bash
supabase db push
```

Or manually run the migration in Supabase SQL Editor by copying the contents of `supabase/migrations/001_rpg.sql`.

## Storage Setup

1. Create a public bucket named `public-assets`:
   - Go to Supabase Dashboard → Storage
   - Create new bucket: `public-assets`
   - Set as public bucket
   - Create folder: `icons/`

2. Upload icons to `icons/` folder in the bucket

3. Reference icons in your app:
```typescript
const iconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets/icons/chef-hat.png`
```

## Game Features

- **Stats Calculation**: STR (protein/10), STA (carbs/25), DEF (fiber/5), LUCK (variety/3)
- **Streak Multiplier**: 1 + 0.1 * floor(streak/7)
- **12-hour Grace**: Log yesterday before noon
- **Streak Freeze**: 1 per month to preserve streak
- **Weekly Bosses**: Morning Fog, Decision Fatigue, Lecture Slump
- **Cosmetic Drops**: Chef Hat, Protein Token, Bottle of Water (common), Chula-Pink Trail, Hollow-Body Guitar (rare)

## Testing

Run RPG tests:
```bash
npm run test src/lib/rpg.test.ts
```

## Usage

Navigate to `/game` to access the RPG interface. Users can:
1. Input breakfast macros and variety score
2. Fight weekly bosses with animated battles
3. Collect cosmetic drops
4. Share progress via Web Share API
5. Use offline mode with localStorage fallback