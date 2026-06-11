# Family Wealth OS

A production-ready Next.js 15 App Router application for family wealth management with a modern dark fintech aesthetic.

## Features

- **16 Pages**: Login, Dashboard, Transactions, Assets, Liabilities, Budget, Goals, Reports, FIRE, Family, Settings
- **Full CRUD Operations**: Add, edit, and delete transactions, assets, liabilities, goals, and family members
- **Mock Financial Data**: Comprehensive mock data for all modules
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **Dark Theme**: Apple + Stripe + Linear inspired dark aesthetic with Inter font
- **Interactive Charts**: AreaChart, PieChart, BarChart using Recharts
- **Service Layer**: Ready for Supabase integration with stub services

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── login/       # Login page
│   ├── dashboard/   # Dashboard with charts
│   ├── transactions/# Transaction management
│   ├── assets/      # Asset management
│   ├── liabilities/ # Liability management with CRUD
│   ├── budget/      # Budget tracking
│   ├── goals/       # Financial goals
│   ├── reports/     # Financial reports
│   ├── fire/        # FIRE calculator
│   ├── family/      # Family member management
│   ├── settings/    # Settings with fixed select issue
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page (redirects to dashboard)
│   └── globals.css  # Global styles
├── components/      # Reusable components
│   └── shared/      # FormModal, DeleteConfirmDialog, EmptyState, StatCard, NavBar, Sidebar, Header, Tabs, MainLayout
├── contexts/        # React contexts
│   └── AppContext.tsx # Global state with mock data
├── data/           # Mock data
│   └── mockData.ts # Initial data for all modules
├── lib/            # Utility functions
│   ├── utils.ts    # cn utility
│   └── formatters.ts # Currency, percentage formatters
├── services/       # Service layer stubs for Supabase
│   ├── transactionService.ts
│   ├── assetService.ts
│   ├── liabilityService.ts
│   ├── goalService.ts
│   └── budgetService.ts
└── types/          # TypeScript types
    └── index.ts    # All domain types
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production

```bash
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (for future integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for a template.

## Deployment

### Vercel

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and configure the build

The `vercel.json` file is pre-configured with optimal settings.

### Manual Deployment

```bash
npm run build
npm start
```

The production build will be in the `.next` directory.

## Key Features Implemented

### Liabilities CRUD
- Full Add/Edit/Delete functionality with modal dialogs
- Debt ratio analysis with visual progress bars
- Monthly payment breakdown
- Payoff calculation and progress tracking

### Settings Page
- Fixed select defaultValue issue using controlled state
- Profile management
- Notification preferences
- Category management
- General settings (currency, language, fiscal year)
- Security settings

### Responsive Design
- Mobile-first approach with Tailwind responsive classes
- Collapsible sidebar for mobile
- Responsive grid layouts
- Touch-friendly interactions

### Charts
- Dashboard: Monthly income/expense trends, net worth growth, category breakdown
- Reports: Income/expense analysis, budget vs actual, net worth projection
- FIRE: Projected growth with FIRE milestone tracking

## Supabase Integration

Service layer stubs are ready for Supabase integration. To connect to Supabase:

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Create a Supabase project and get your credentials

3. Update `.env.local` with your Supabase URL and anon key

4. Update service files to use Supabase client instead of mock functions

Example for `transactionService.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
  return { data, error }
}
```

## Database Schema (Supabase)

When integrating Supabase, create the following tables:

- `transactions` - id, type, category, amount, account_id, user_id, note, date
- `assets` - id, type, name, value, currency, icon, color
- `liabilities` - id, type, name, total_amount, amount, interest_rate, monthly_payment, start_date, end_date, notes
- `budgets` - id, category, monthly_limit, spent, icon, color
- `goals` - id, name, target_amount, current_amount, target_date, monthly_contribution, icon, color
- `family_members` - id, name, role, avatar, email, join_date

## Performance Optimization

- Static page generation for all routes
- Optimized bundle size with code splitting
- TailwindCSS for minimal CSS footprint
- Recharts for efficient chart rendering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes.