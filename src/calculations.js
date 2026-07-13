// calculations.js
// Core logic for the Parental Legacy & Life Factors Calculator.
//
// Rules implemented (from the assessment brief):
//   1. Each factor has a fixed Total. The seven totals sum to exactly 100.
//   2. Mother Value + Father Value = Total, for every factor.
//   3. Odd day-of-month  -> Mother is the dominant (higher) parent.
//      Even day-of-month -> Father is the dominant (higher) parent.
//   4. Values are deterministic: the same Date of Birth always produces the
//      same result (a seeded PRNG derived from the date, not Math.random).

// Fixed factor totals. These are the seven "life factors" from the brief;
// their totals sum to exactly 100.000, satisfying the grand-total rule.
export const FACTORS = [
  { key: 'genetic', name: 'Genetic Inheritance', total: 20.952, min: 9.333, max: 10.777 },
  { key: 'vitality', name: 'Constitutional Vitality', total: 16.743, min: 8.111, max: 9.111 },
  { key: 'mental', name: 'Mental Patterns', total: 13.199, min: 6.111, max: 7.111 },
  { key: 'intellect', name: 'Intellectual Capacity', total: 12.759, min: 6.333, max: 6.999 },
  { key: 'emotional', name: 'Emotional Foundation', total: 13.988, min: 7.111, max: 7.999 },
  { key: 'spiritual', name: 'Spiritual Lineage', total: 11.084, min: 5.011, max: 6.011 },
  { key: 'soul', name: 'Soul Connections', total: 11.275, min: 5.111, max: 6.222 },
]

// Sanity check kept at module load time (dev aid, not user-facing).
const TOTAL_CHECK = FACTORS.reduce((s, f) => s + f.total, 0)
if (Math.abs(TOTAL_CHECK - 100) > 0.001) {
  // eslint-disable-next-line no-console
  console.warn(`Factor totals sum to ${TOTAL_CHECK}, expected 100`)
}

/**
 * Mulberry32 - a tiny, fast, seedable PRNG.
 * Using a seeded PRNG (instead of Math.random) is what makes the same
 * Date of Birth always generate the same values, as required by
 * "Auto-Calculation" being a deterministic function of the input date.
 */
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Build a numeric seed from a DOB (day/month/year all contribute). */
function seedFromDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  // Mix the three components so different dates map to well-separated seeds.
  return day * 100003 + month * 10007 + year * 17
}

function round3(n) {
  return Math.round(n * 1000) / 1000
}

/**
 * Validates a Date of Birth.
 * Returns { valid: boolean, error?: string }
 */
export function validateDOB(dateString) {
  if (!dateString) return { valid: false, error: 'Please select a date of birth.' }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return { valid: false, error: 'That date is not valid.' }
  }
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (date > today) {
    return { valid: false, error: 'Date of birth cannot be in the future.' }
  }
  const minDate = new Date('1900-01-01')
  if (date < minDate) {
    return { valid: false, error: 'Please enter a date after 1900.' }
  }
  return { valid: true }
}

/**
 * Core calculation: given a DOB string (YYYY-MM-DD from <input type="date">),
 * returns the full breakdown of Mother / Father / Total per factor plus
 * grand totals and which parent carries the higher overall legacy.
 */
export function calculateLifeFactors(dateString) {
  const date = new Date(dateString)
  const day = date.getDate()
  const isOddDay = day % 2 === 1
  const rng = mulberry32(seedFromDate(date))

  const results = FACTORS.map((factor) => {
    // The dominant parent (per the odd/even rule) takes 55-65% of the
    // factor's total; the split is seeded per-factor so the "gap" between
    // parents varies naturally across factors rather than being a flat 60/40.
    const dominantShare = 0.55 + rng() * 0.1 // 0.55 - 0.65

    let motherValue
    let fatherValue
    if (isOddDay) {
      motherValue = round3(factor.total * dominantShare)
      fatherValue = round3(factor.total - motherValue)
    } else {
      fatherValue = round3(factor.total * dominantShare)
      motherValue = round3(factor.total - fatherValue)
    }

    return {
      key: factor.key,
      name: factor.name,
      mother: motherValue,
      father: fatherValue,
      total: round3(motherValue + fatherValue),
      range: { min: factor.min, max: factor.max },
      dominant: motherValue >= fatherValue ? 'Mother' : 'Father',
    }
  })

  const motherTotal = round3(results.reduce((s, r) => s + r.mother, 0))
  const fatherTotal = round3(results.reduce((s, r) => s + r.father, 0))
  const grandTotal = round3(motherTotal + fatherTotal)

  return {
    dob: dateString,
    dayOfMonth: day,
    isOddDay,
    dominantParent: motherTotal >= fatherTotal ? 'Mother' : 'Father',
    factors: results,
    motherTotal,
    fatherTotal,
    grandTotal,
  }
}
