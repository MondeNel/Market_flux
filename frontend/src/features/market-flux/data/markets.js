/**
 * @file src/features/market-flux/data/markets.js
 *
 * @description
 * Markets the player can choose from.
 *
 * Prices are simulation start values, not live quotes. `volatility` is the
 * largest fraction a price can move in one tick (0.0013 = 0.13%) at one tick per 500ms.
 */

export const MARKETS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    glyph: '₿',
    color: '#f7931a',
    glyphColor: '#ffffff',
    startPrice: 86538.74,
    decimals: 2,
    volatility: 0.0013,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    glyph: 'Ξ',
    color: '#627eea',
    glyphColor: '#ffffff',
    startPrice: 3245.18,
    decimals: 2,
    volatility: 0.0016,
  },
  {
    id: 'sol',
    name: 'Solana',
    pair: 'SOL/USDT',
    glyph: '◎',
    color: '#14f195',
    glyphColor: '#04121a',
    startPrice: 148.62,
    decimals: 2,
    volatility: 0.0021,
  },
  {
    id: 'bnb',
    name: 'BNB',
    pair: 'BNB/USDT',
    glyph: 'B',
    color: '#f3ba2f',
    glyphColor: '#1a1200',
    startPrice: 612.4,
    decimals: 2,
    volatility: 0.0014,
  },
  {
    id: 'xrp',
    name: 'XRP',
    pair: 'XRP/USDT',
    glyph: 'X',
    color: '#2b3440',
    glyphColor: '#ffffff',
    startPrice: 0.5231,
    decimals: 4,
    volatility: 0.0018,
  },
]

export const DEFAULT_MARKET_ID = 'btc'

export const MARKETS_BY_ID = Object.fromEntries(
  MARKETS.map((market) => [market.id, market]),
)