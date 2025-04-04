export type StockList = {
  sl_id: number,
  user_id: number,
  visibility: 'public' | 'private' | 'shared',
  name: string,
  created_at: string,
}

export type Stock = {
  symbol: string
}

export type StockOwned = {
  sl_id: number,
  symbol: string,
  amount: number,
  created_at: string,
  updated_at: string,
}

export type Portfolio = {
  port_id: number,
  user_id: number, 
  sl_id: number,
  cash_account: string,
  name: string,
  created_at: string,
}