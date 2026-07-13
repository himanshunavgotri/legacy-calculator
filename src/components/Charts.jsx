import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const MOTHER_COLOR = '#A24D3D' // lineage.rose
const FATHER_COLOR = '#0F3D3E' // lineage.teal

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-md border border-lineage-mist bg-parchment px-3 py-2 text-xs font-body shadow-lg dark:bg-ink dark:border-ink dark:text-parchment">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(3)}
        </p>
      ))}
    </div>
  )
}

export function FactorComparisonChart({ factors }) {
  const data = factors.map((f) => ({
    name: f.name.replace(' ', '\n'),
    Mother: f.mother,
    Father: f.father,
  }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE4E0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#5b6b66' }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={70}
        />
        <YAxis tick={{ fontSize: 11, fill: '#5b6b66' }} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(201,162,75,0.08)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Mother" fill={MOTHER_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Father" fill={FATHER_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LegacySplitPie({ motherTotal, fatherTotal }) {
  const data = [
    { name: 'Mother', value: motherTotal },
    { name: 'Father', value: fatherTotal },
  ]
  const colors = [MOTHER_COLOR, FATHER_COLOR]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={colors[i]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
