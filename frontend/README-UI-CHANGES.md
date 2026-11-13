# SevaCoop frontend — new UI

Re-skinned to match the SevaSetu build. Backend and API calls are unchanged.

## Run
    cd frontend
    npm install
    npm run dev        # proxies /api -> http://localhost:8000

## What changed
- New design system: emerald theme, Geist font, shared UI kit (`src/components/ui.jsx`), theme in `tailwind.config.js` + `src/index.css`
- Landing page (`pages/Home.jsx`), split-screen login/register (`pages/AuthPage.jsx`)
- Sidebar dashboard shell for customer / worker / admin (`components/DashboardShell.jsx`)
- New customer Overview at `/dashboard`; signed-in users are redirected from `/` to their dashboard
- Worker and admin dashboards use sidebar tabs (Overview, Jobs, Profile, Earnings / Workers, Bookings, Services)
- Language switcher now lists 6 languages (`src/i18n.jsx`); missing keys fall back to English
- Brand name is one constant: `BRAND` in `src/lib/cn.js`
- New deps: lucide-react, framer-motion
