# 🔮 Foresight

Navigate custody battles with confidence. Step-by-step guides, AI assistance, and community support.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example file and add your API keys:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:
- **Supabase**: Get from [supabase.com](https://supabase.com) → Your Project → Settings → API
- **Anthropic**: Get from [console.anthropic.com](https://console.anthropic.com)
- **Stripe**: Get from [stripe.com](https://stripe.com) → Developers → API Keys

### 3. Set Up Database
1. Go to your Supabase project
2. Click **SQL Editor** in the sidebar
3. Copy contents of `supabase/migrations/001_initial.sql`
4. Paste and click **Run**

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Project Structure

```
foresight/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── ai/                # AI chat
│   ├── filing/            # Filing guide
│   ├── community/         # Community chat
│   └── ...
├── components/            # React components
├── lib/                   # Utilities & services
├── public/               # Static files
└── supabase/             # Database migrations
```

## Features

- ✅ Step-by-step filing guides
- ✅ AI assistant (Claude)
- ✅ Community chat
- ✅ Mentor matching
- ✅ Document upload & analysis
- ✅ Deadline tracking
- ✅ Mobile PWA

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Support

Questions? Email support@foresight.app

---

Built with ❤️ in Saskatchewan, Canada
