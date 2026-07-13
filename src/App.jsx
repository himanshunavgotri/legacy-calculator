import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { calculateLifeFactors, validateDOB } from './calculations.js'
import { FactorTable } from './components/FactorTable.jsx'
import { FactorComparisonChart, LegacySplitPie } from './components/Charts.jsx'

const HISTORY_KEY = 'legacy-calculator:history'

// ---- state -----------------------------------------------------------

const initialState = {
  dob: '',
  error: null,
  result: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DOB':
      return { ...state, dob: action.dob, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.error, result: null }
    case 'SET_RESULT':
      return { ...state, error: null, result: action.result }
    default:
      return state
  }
}

// ---- helpers -----------------------------------------------------------

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 8)))
  } catch {
    // localStorage unavailable (e.g. private mode) - fail silently
  }
}

function toCSV(result) {
  const header = 'Factor,Mother,Father,Total\n'
  const rows = result.factors
    .map((f) => `${f.name},${f.mother.toFixed(3)},${f.father.toFixed(3)},${f.total.toFixed(3)}`)
    .join('\n')
  const footer = `\nGrand Total,${result.motherTotal.toFixed(3)},${result.fatherTotal.toFixed(3)},${result.grandTotal.toFixed(3)}`
  return header + rows + footer
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ---- component -----------------------------------------------------------

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [darkMode, setDarkMode] = useState(false)
  const [history, setHistory] = useState(loadHistory)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function handleDobChange(e) {
    const dob = e.target.value
    dispatch({ type: 'SET_DOB', dob })

    const { valid, error } = validateDOB(dob)
    if (!valid) {
      if (dob) dispatch({ type: 'SET_ERROR', error })
      return
    }

    const result = calculateLifeFactors(dob)
    dispatch({ type: 'SET_RESULT', result })

    const nextHistory = [{ dob, dominantParent: result.dominantParent }, ...history.filter((h) => h.dob !== dob)]
    setHistory(nextHistory)
    saveHistory(nextHistory)
  }

  function handleExportCSV() {
    if (!state.result) return
    downloadFile(`legacy-${state.result.dob}.csv`, toCSV(state.result), 'text/csv')
  }

  function handlePrint() {
    window.print()
  }

  const result = state.result

  return (
    <div className="min-h-screen bg-parchment dark:bg-ink text-ink dark:text-parchment font-body transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-lineage-mist dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-lineage-gold mb-2">
              Inheritance &amp; Vitality Index
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Parental Legacy &amp;<br className="hidden sm:block" /> Life Factors Calculator
            </h1>
          </div>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="shrink-0 rounded-full border border-lineage-teal/30 dark:border-lineage-gold/40 px-4 py-2 text-sm font-medium hover:bg-lineage-teal hover:text-parchment dark:hover:bg-lineage-gold dark:hover:text-ink transition-colors"
          >
            {darkMode ? '☀ Light' : '● Dark'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Input card */}
        <section className="rounded-2xl border border-lineage-mist dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6 sm:p-8">
          <label htmlFor="dob" className="block font-display text-lg mb-1">
            Enter your Date of Birth
          </label>
          <p className="text-sm text-ink/60 dark:text-parchment/60 mb-4">
            Values are generated automatically — an odd birth-day favors the maternal line, an even
            birth-day favors the paternal line.
          </p>
          <input
            id="dob"
            type="date"
            value={state.dob}
            max={today}
            onChange={handleDobChange}
            className="w-full sm:w-64 rounded-lg border border-lineage-mist dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-lineage-gold"
          />
          {state.error && (
            <p role="alert" className="mt-3 text-sm text-lineage-rose font-medium">
              {state.error}
            </p>
          )}

          {history.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wide text-ink/40 dark:text-parchment/40 self-center mr-1">
                Recent:
              </span>
              {history.map((h) => (
                <button
                  key={h.dob}
                  onClick={() => handleDobChange({ target: { value: h.dob } })}
                  className="text-xs font-mono rounded-full border border-lineage-mist dark:border-white/15 px-3 py-1 hover:border-lineage-gold transition-colors"
                >
                  {h.dob}
                </button>
              ))}
            </div>
          )}
        </section>

        {result && (
          <>
            {/* Summary strip */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard label="Mother Total" value={result.motherTotal} accent="rose" />
              <SummaryCard label="Father Total" value={result.fatherTotal} accent="teal" />
              <SummaryCard label="Grand Total" value={result.grandTotal} accent="gold" isTotal />
            </section>

            {/* Dominant parent banner */}
            <section className="rounded-2xl bg-lineage-teal text-parchment px-6 py-5 flex items-center justify-between flex-wrap gap-3">
              <p className="font-display text-lg">
                For this date, the <span className="text-lineage-gold font-semibold">{result.dominantParent}</span>{' '}
                carries the stronger overall legacy.
              </p>
              <p className="font-mono text-xs text-parchment/70">
                Day {result.dayOfMonth} · {result.isOddDay ? 'Odd' : 'Even'} day-of-month
              </p>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-lineage-mist dark:border-white/10 p-6">
                <h2 className="font-display text-lg mb-4">Mother vs Father — by Factor</h2>
                <FactorComparisonChart factors={result.factors} />
              </div>
              <div className="rounded-2xl border border-lineage-mist dark:border-white/10 p-6">
                <h2 className="font-display text-lg mb-4">Overall Split</h2>
                <LegacySplitPie motherTotal={result.motherTotal} fatherTotal={result.fatherTotal} />
              </div>
            </section>

            {/* Table */}
            <section>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-display text-lg">Detailed Breakdown</h2>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handleExportCSV}
                    className="text-sm font-medium rounded-full border border-lineage-teal/30 dark:border-lineage-gold/40 px-4 py-1.5 hover:bg-lineage-teal hover:text-parchment dark:hover:bg-lineage-gold dark:hover:text-ink transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-sm font-medium rounded-full border border-lineage-teal/30 dark:border-lineage-gold/40 px-4 py-1.5 hover:bg-lineage-teal hover:text-parchment dark:hover:bg-lineage-gold dark:hover:text-ink transition-colors"
                  >
                    Export PDF (Print)
                  </button>
                </div>
              </div>
              <FactorTable factors={result.factors} />
            </section>
          </>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-ink/40 dark:text-parchment/40 font-mono">
        Deterministic per date of birth · Built with React, Tailwind &amp; Recharts
      </footer>
    </div>
  )
}

function SummaryCard({ label, value, accent, isTotal }) {
  const accentClass = {
    rose: 'text-lineage-rose',
    teal: 'text-lineage-teal dark:text-lineage-gold',
    gold: 'text-lineage-gold',
  }[accent]

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isTotal
          ? 'border-lineage-gold bg-lineage-gold/10'
          : 'border-lineage-mist dark:border-white/10 bg-white/60 dark:bg-white/[0.03]'
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-parchment/50 mb-1">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accentClass}`}>{value.toFixed(3)}</p>
    </div>
  )
}
