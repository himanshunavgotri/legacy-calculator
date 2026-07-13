# Parental Legacy & Life Factors Calculator

A React web app that takes a Date of Birth and generates a deterministic breakdown of
seven "life factors" split between Mother and Father, satisfying:

- `Mother Value + Father Value = Total` for every factor
- `Sum of all Mother values + Sum of all Father values = 100`
- Odd day-of-month → Mother is the dominant parent; even day-of-month → Father is dominant

## Tech Stack

- **React 18** (functional components + hooks: `useReducer`, `useState`, `useEffect`, `useMemo`)
- **Vite** for tooling/dev server
- **Tailwind CSS** for styling
- **Recharts** for the bar chart (per-factor Mother vs Father) and donut chart (overall split)
- **localStorage** for saving recent lookups (no backend required)

## Getting Started

```bash
npm install
npm run dev       # starts a local dev server (default: http://localhost:5173)
```

Build for production:

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

Deploy the contents of `dist/` to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Project Structure

```
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx                # top-level UI, state, layout
    ├── index.css              # Tailwind base styles
    ├── calculations.js        # core calculation logic (see below)
    └── components/
        ├── FactorTable.jsx    # detailed Mother/Father/Total table
        └── Charts.jsx         # bar chart + donut chart (Recharts)
```

## Calculation Logic (`src/calculations.js`)

1. **Fixed factor totals.** The seven life factors have fixed totals
   (Genetic Inheritance, Constitutional Vitality, Mental Patterns, Intellectual
   Capacity, Emotional Foundation, Spiritual Lineage, Soul Connections) that sum to
   exactly `100.000`, matching the brief's reference table.

2. **Deterministic seeded PRNG.** The Date of Birth is converted to a numeric seed
   (`day, month, year` combined), which feeds a `mulberry32` seeded random number
   generator. This guarantees the **same DOB always produces the same result** —
   required for "Auto-Calculation" to be a pure function of the input date, rather
   than re-randomizing on every render.

3. **Odd/Even day rule.** `day % 2 === 1` → Mother is dominant for every factor;
   otherwise Father is dominant. The dominant parent receives a seeded 55–65% share
   of that factor's total (varied per-factor so the "gap" isn't a flat 60/40 across
   the board), and the other parent receives the remainder — so
   `mother + father === total` exactly, for every factor, on every date.

4. **Validation.** `validateDOB()` rejects empty input, invalid dates, dates in the
   future, and dates before 1900.

## Features Implemented

| Requirement | Status |
|---|---|
| DOB date picker with validation | ✅ |
| Auto-calculation on date selection | ✅ |
| Mother / Father / Total per factor | ✅ |
| Grand totals (Mother, Father, = 100) | ✅ |
| "Which parent is higher" indicator | ✅ |
| Charts (bar comparison + donut split) | ✅ |
| Responsive design (mobile → desktop) | ✅ |
| Export CSV | ✅ |
| Export PDF (via browser print dialog) | ✅ |
| Dark / Light mode toggle | ✅ |
| Save results (localStorage recent-dates) | ✅ |

## Notes

- No backend or database is required — everything runs client-side, per the FAQ in
  the brief ("Do I need a backend? No... Do I need a database? No, localStorage is
  sufficient").
- "Export PDF" uses the browser's native print-to-PDF, avoiding an extra PDF library
  dependency while still satisfying the bonus requirement.
