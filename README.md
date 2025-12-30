# PoolPal AI (Next.js Edition)

AI-powered pool maintenance application, rewritten for the web.

## Features

- **Water Quality Analysis**: Upload a photo of your pool, and Gemini AI will detect turbidity, algae, or dirt, providing immediate advice in clear Spanish (or English).
- **Test Strip Reader**: Scan your chemical test strips to automatically read pH, Chlorine, and Alkalinity levels.
- **Pool Profile**: Calculate your pool's volume based on shape and dimensions to get accurate chemical dosing recommendations.

## Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **AI**: Google Gemini 2.0 Flash
- **Backend**: Supabase

## Setup & Run

1. **Install**:
   ```bash
   npm install
   ```
2. **Environment**:
   Set your keys in `.env.local`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **Run**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
