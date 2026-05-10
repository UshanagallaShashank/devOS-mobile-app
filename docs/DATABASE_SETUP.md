# Database Setup — Supabase

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `devos` — pick a region close to you
3. Save the **Project URL** and **anon key** (you'll need them for `.env`)

## 2. Run the Migration

Open the **SQL Editor** in your Supabase dashboard and paste the contents of:

```
supabase/migrations/001_init.sql
```

Click **Run**. This creates all tables, indexes, RLS policies, and triggers.

## 3. Seed Dev Data (optional)

In the same SQL editor, paste and run `supabase/seed.sql` for local test data.

## 4. Copy keys to .env

```bash
cp .env.example .env
```

Fill in:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...   # Settings → API → service_role key
```

## Tables Created

| Table | Purpose |
|---|---|
| `user_profiles` | Skills, experience, target roles, resume text |
| `streaks` | Current + longest daily streak |
| `tasks` | Daily checklist items per user per date |
| `agent_results` | Latest AI agent output (resume score, job matches, topic) |
| `dsa_attempts` | Problem-solving history for weak-area tracking |

## Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only read/write **their own rows** via `auth.uid()`
- The backend uses the **service role key** (bypasses RLS for server writes)

## Auth Setup

In Supabase dashboard → Authentication:
1. Enable **Email** provider
2. Disable "Confirm email" for local dev (enable in production)
3. Set **Site URL** to `devos://` (your Expo scheme)
