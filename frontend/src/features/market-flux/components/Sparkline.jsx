/**
 * @file src/features/market-flux/components/Sparkline.jsx
 *
 * @description
 * Compact price sparkline for the Market Flux asset row.
 *
 * - Line and soft area fill, coloured by trend.
 * - Optional dashed baseline (used for the price at round open).
 * - Glowing end dot on the latest point.
 *
 * Presentational only. The caller supplies the points.
 *
 * The SVG is stretched to its container (`preserveAspectRatio="none"`),
 * so strokes use `vector-effect: non-scaling-stroke` to stay a constant
 * width. The end dot is an HTML element for the same reason: a circle
 * inside a stretched SVG would be squashed into an oval.
 */

import { useId } from 'react'

const WIDTH = 100
const HEIGHT = 32
const PAD = 3

const TONES = {
  up: {
    stroke: '#39FF88',
    glow: 'rgba(57,255,136,0.65)',
  },

  down: {
    stroke: '#FF3158',
    glow: 'rgba(255,49,88,0.65)',
  },

  flat: {
    stroke: '#7DD3FC',
    glow: 'rgba(125,211,252,0.55)',
  },
}

/**
 * @param {object} props
 * @param {number[]} props.points Prices, oldest first.
 * @param {number} [props.baseline] Price to draw a dashed reference line at.
 * @param {'up'|'down'|'flat'} [props.tone='flat']
 * @param {string} [props.className] Sizing, e.g. "h-7 w-14".
 * @returns {JSX.Element}
 */
function Sparkline({
  points,
  baseline,
  tone = 'flat',
  className = '',
}) {
  const gradientId =
    `spark-${useId().replace(/:/g, '')}`

  const palette =
    TONES[tone] ?? TONES.flat

  const hasLine =
    points.length >= 2

  const values =
    baseline === undefined
      ? points
      : [...points, baseline]

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min

  const x = (index) =>
    (index / (points.length - 1)) *
    WIDTH

  const y = (value) =>
    span === 0
      ? HEIGHT / 2
      : HEIGHT -
        PAD -
        ((value - min) / span) *
          (HEIGHT - PAD * 2)

  const linePath = hasLine
    ? points
        .map(
          (value, index) =>
            `${index === 0 ? 'M' : 'L'}${x(index).toFixed(2)} ${y(value).toFixed(2)}`,
        )
        .join(' ')
    : ''

  const areaPath = hasLine
    ? `${linePath} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`
    : ''

  const lastY = hasLine
    ? y(points[points.length - 1])
    : HEIGHT / 2

  return (
    <div
      aria-hidden="true"
      className={`relative ${className}`}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stopColor={palette.stroke}
              stopOpacity="0.28"
            />

            <stop
              offset="1"
              stopColor={palette.stroke}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {hasLine ? (
          <>
            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
            />

            {baseline !== undefined && (
              <line
                x1="0"
                x2={WIDTH}
                y1={y(baseline)}
                y2={y(baseline)}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            <path
              d={linePath}
              fill="none"
              stroke={palette.stroke}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                filter: `drop-shadow(0 0 3px ${palette.glow})`,
              }}
            />
          </>
        ) : (
          <line
            x1="0"
            x2={WIDTH}
            y1={HEIGHT / 2}
            y2={HEIGHT / 2}
            stroke={palette.stroke}
            strokeOpacity="0.5"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {hasLine && (
        <span
          className="
            absolute
            right-0
            h-1.5
            w-1.5
            -translate-y-1/2
            translate-x-1/2
            rounded-full
          "
          style={{
            top: `${(lastY / HEIGHT) * 100}%`,
            background: palette.stroke,
            boxShadow: `0 0 6px ${palette.glow}`,
          }}
        />
      )}
    </div>
  )
}

export default Sparkline