/**
 * @file src/features/market-flux/utils/formatMoney.js
 *
 * @description
 * Number formatting for every Market Flux component, in South African
 * style: decimal comma, non-breaking space between thousands.
 *
 *   formatMoney(100, { decimals: 2 })    -> "R100,00"
 *   formatMoney(10000, { decimals: 2 })  -> "R10 000,00"
 *   formatMoney(30)                      -> "R30"
 *   formatMoney(30, { sign: true })      -> "+R30"
 *   formatMoney(-30)                     -> "-R30"
 *
 *   formatPrice(86426.21, 2)             -> "86426,21"
 *
 * formatPrice is for the digit reels: the decimal comma, but no thousands
 * grouping, so every character is either a digit or the single comma.
 */

const NBSP = '\u00A0'

function formatNumber(value, decimals, group) {
  const [whole, fraction] =
    Math.abs(value)
      .toFixed(decimals)
      .split('.')

  const integer = group
    ? whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        NBSP,
      )
    : whole

  return fraction
    ? `${integer},${fraction}`
    : integer
}

/**
 * @param {number|string} value
 * @param {object} [options]
 * @param {number} [options.decimals=0]
 * @param {boolean} [options.sign=false] Prefix positive amounts with "+".
 * @returns {string}
 */
export function formatMoney(
  value,
  { decimals = 0, sign = false } = {},
) {
  const amount = Number(value) || 0

  const rounded = Number(
    Math.abs(amount).toFixed(decimals),
  )

  const prefix =
    rounded === 0
      ? ''
      : amount < 0
        ? '-'
        : sign
          ? '+'
          : ''

  return `${prefix}R${formatNumber(amount, decimals, true)}`
}

/**
 * @param {number|string} value
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatPrice(
  value,
  decimals = 2,
) {
  return formatNumber(
    Number(value) || 0,
    decimals,
    false,
  )
}