# Timekeeper & Paycheck Projector

A mobile-friendly timekeeper and projected paycheck calculator for hourly workers. Enter your punches and see regular, overtime, double-time and holiday hours, gross pay, every deduction, and your projected take-home pay update live.

**Live app:** https://psycosis1276.github.io/timekeeper-paycheck/ (once GitHub Pages is enabled; see below)

## Features
- Manual punch entry: multiple in/out punches per day, unpaid lunch, overnight shifts across midnight, weekly or biweekly periods.
- Overtime rules: daily + weekly (default: over 8/day and over 40/week at 1.5x, no double counting), weekly only, or daily only. Optional double time over 12h and a 7th-consecutive-day rule.
- Holiday pay presets (straight time, 1.5x, 2x, paid holiday hours, combinations, custom), per-day overrides, and "higher of" vs "stack" when holiday hours hit overtime.
- Deductions: pre-tax 401(k), pre-tax insurance, Roth 401(k), union dues, and any number of miscellaneous deductions (fixed $ or % of gross; every period, one-time, or installment with a tracked balance).
- Taxes: Social Security (2026 wage base $184,500), Medicare (+0.9% over $200k), federal income tax withholding using the IRS Pub 15-T 2026 percentage method for 2020+ W-4s, and a state picker for all 50 states + DC with state payroll taxes (CA SDI, NY SDI/PFL, NJ SDI/FLI/UI, WA PFML/Cares, and others), plus a local/city tax %.
- Year-to-date totals across saved pay periods.
- Installable as a PWA; works offline after the first visit.

## Privacy
The app collects **no personal information**: no name, SSN, address, ZIP, employer, employee ID, birthdate, email or phone. It only uses pay inputs (rates, hours, filing status, allowance counts, deduction amounts, state, local tax %). All data is stored in your browser's localStorage and never leaves your device. There is no server, no analytics, and no tracking.

## Tax figures are estimates
Federal withholding follows the published 2026 IRS tables, but state and local figures are estimates. Many states are approximated with their annual tax brackets instead of their exact withholding tables; each state's note in the app says so. Your actual paycheck may differ. This is not tax advice.

## Project layout
- `src/payMath.ts`: pay, overtime, holiday, deduction and federal tax math (pure functions, no UI).
- `src/stateData.ts`: `STATE_DATA` table (2026 rates, brackets, deductions, payroll taxes, source URL per state) and `stateCalc`.
- `src/App.tsx`, `src/kit.tsx`, `src/styles.css`: the UI.
- `tests/payMath.test.ts`: overtime, holiday preset, sample week and state test cases.
- `docs/`: the built static site, served by GitHub Pages.

## Run and build
```bash
npm install
npm test        # run the math tests
npm run dev     # local dev server
npm run build   # type-check and build static files into docs/
```

## Enable GitHub Pages
Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs` → Save**. The app is then served at https://psycosis1276.github.io/timekeeper-paycheck/.

## License
No license has been chosen yet, so all rights are reserved by default.
