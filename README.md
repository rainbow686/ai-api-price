# AI Cost Optimizer

Real-time AI API cost tracking and budget management for small-medium teams.

## Features

- **AI Gateway (Proxy Mode)** - Unified API endpoint for OpenAI, Anthropic, Google
- **Cost Dashboard** - Real-time cost tracking and usage analytics
- **Budget Alerts** - Configurable budget limits with automated alerts

## Quick Start

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migration:
   ```bash
   # In Supabase SQL Editor, run the contents of:
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your API keys from Project Settings → API

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install & Run

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-api-price/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── api/                # API routes (Gateway)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── gateway/            # Gateway logic
│       └── supabase/           # Database client
├── supabase/
│   └── migrations/             # Database migrations
├── docs/                       # Architecture & design docs
└── DESIGN.md                   # Design system
```

## Architecture

See [docs/engineering-review.md](docs/engineering-review.md) for complete architecture documentation.

## License

MIT
