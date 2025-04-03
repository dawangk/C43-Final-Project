export type StockList = {
  sl_id: number,
  user_id: number,
  visibility: 'public' | 'private' | 'shared',
  name: string,
}

export type Stock = {
  symbol: string
}

export type StockOwned = {
  sl_id: number,
  symbol: string,
  amount: number,
}