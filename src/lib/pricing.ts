export type BHKType = '1BHK' | '2BHK' | '3BHK' | '4BHK+'
export type ProjectType = 'new-home' | 'renovation'
export type BudgetRange = '3-5' | '5-7' | '7-10' | '10-15' | '15-18' | '20+'

export interface PricingRule {
  bhk: BHKType
  projectType: ProjectType
  baseRatePerSqFt: number        // INR per sq ft
  renovationMultiplier: number   // applied if renovation
}

// Provisional placeholder rates – to be confirmed by Triarch
// clearly marked as indicative only
export const PROVISIONAL_RATES: PricingRule[] = [
  { bhk: '1BHK', projectType: 'new-home',   baseRatePerSqFt: 1200, renovationMultiplier: 0.75 },
  { bhk: '2BHK', projectType: 'new-home',   baseRatePerSqFt: 1150, renovationMultiplier: 0.75 },
  { bhk: '3BHK', projectType: 'new-home',   baseRatePerSqFt: 1100, renovationMultiplier: 0.75 },
  { bhk: '4BHK+', projectType: 'new-home',  baseRatePerSqFt: 1050, renovationMultiplier: 0.75 },
  { bhk: '1BHK', projectType: 'renovation', baseRatePerSqFt: 900, renovationMultiplier: 1 },
  { bhk: '2BHK', projectType: 'renovation', baseRatePerSqFt: 875, renovationMultiplier: 1 },
  { bhk: '3BHK', projectType: 'renovation', baseRatePerSqFt: 850, renovationMultiplier: 1 },
  { bhk: '4BHK+', projectType: 'renovation',baseRatePerSqFt: 820, renovationMultiplier: 1 },
]

export interface EstimateResult {
  low: number
  high: number
  isProvisional: boolean
  hasMatch: boolean
}

export function calculateEstimate(
  bhk: BHKType,
  sqft: number,
  projectType: ProjectType,
  roomCount: number
): EstimateResult {
  const rule = PROVISIONAL_RATES.find(
    r => r.bhk === bhk && r.projectType === projectType
  )

  if (!rule || sqft <= 0) {
    return { low: 0, high: 0, isProvisional: true, hasMatch: false }
  }

  const rate = projectType === 'renovation'
    ? rule.baseRatePerSqFt
    : rule.baseRatePerSqFt

  const base = sqft * rate
  const roomBonus = roomCount * 15000 // per additional room type
  const low = Math.round((base + roomBonus) * 0.9 / 10000) * 10000
  const high = Math.round((base + roomBonus) * 1.15 / 10000) * 10000

  return { low, high, isProvisional: true, hasMatch: true }
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export const BUDGET_RANGES = [
  { value: '3-5',   label: '₹3–5 Lakh' },
  { value: '5-7',   label: '₹5–7 Lakh' },
  { value: '7-10',  label: '₹7–10 Lakh' },
  { value: '10-15', label: '₹10–15 Lakh' },
  { value: '15-18', label: '₹15–18 Lakh' },
  { value: '20+',   label: '₹20 Lakh+' },
]
