import React from 'react'

export function FactorTable({ factors }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-lineage-mist dark:border-white/10">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="bg-lineage-teal text-parchment text-left">
            <th className="px-4 py-3 font-medium">Life Factor</th>
            <th className="px-4 py-3 font-medium text-right">Mother</th>
            <th className="px-4 py-3 font-medium text-right">Father</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium text-center">Higher</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((f, i) => (
            <tr
              key={f.key}
              className={`${
                i % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-lineage-mist/30 dark:bg-white/[0.02]'
              } border-t border-lineage-mist/60 dark:border-white/10`}
            >
              <td className="px-4 py-3 text-ink dark:text-parchment font-medium">{f.name}</td>
              <td className="px-4 py-3 text-right font-mono text-lineage-rose">{f.mother.toFixed(3)}</td>
              <td className="px-4 py-3 text-right font-mono text-lineage-teal dark:text-lineage-gold">
                {f.father.toFixed(3)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-ink/70 dark:text-parchment/70">
                {f.total.toFixed(3)}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    f.dominant === 'Mother'
                      ? 'bg-lineage-rose/10 text-lineage-rose'
                      : 'bg-lineage-teal/10 text-lineage-teal dark:text-lineage-gold'
                  }`}
                >
                  {f.dominant}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-lineage-teal font-semibold bg-lineage-gold/10">
            <td className="px-4 py-3 text-ink dark:text-parchment">Grand Total</td>
            <td className="px-4 py-3 text-right font-mono text-lineage-rose">
              {factors.reduce((s, f) => s + f.mother, 0).toFixed(3)}
            </td>
            <td className="px-4 py-3 text-right font-mono text-lineage-teal dark:text-lineage-gold">
              {factors.reduce((s, f) => s + f.father, 0).toFixed(3)}
            </td>
            <td className="px-4 py-3 text-right font-mono text-ink dark:text-parchment">
              {factors.reduce((s, f) => s + f.total, 0).toFixed(3)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
