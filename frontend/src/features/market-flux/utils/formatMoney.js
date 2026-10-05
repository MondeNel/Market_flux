/**
 * @file src/features/market-flux/utils/formatMoney.js
 *
 * @description
 * Single money formatter for every Market Flux component.
 *
 *   formatMoney(10000, { decimals: 2 })   -> "R10,000.00"
 *   formatMoney(30)                       -> "R30"
 *   formatMoney(30, { sign: true })       -> "+R30"
 *   formatMoney(-30)                      -> "-R30"
 */

export function formatMoney(
  value,
  { decimals = 0, sign = false } = {},
) {
  const amount = Number(value) || 0

  const digits = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  const prefix =
    amount < 0 ? '-' : sign && amount > 0 ? '+' : ''

  return `${prefix}R${digits}`
}