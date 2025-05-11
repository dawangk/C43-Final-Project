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

export type StockOwnedWithData = StockOwned & {
  open: number,
  close: number,
  volume: number,
  high: number,
  low: number,
  timestamp: string,
  performance_day: number,
  performance_year: number,
}

export type StockStats = {
  symbol: string,
  coefficient_of_variance: number,
  beta: number,
}

export type Portfolio = {
  port_id: number,
  user_id: number, 
  sl_id: number,
  cash_account: string,
  name: string,
  created_at: string,
}

export type PortfolioResponse = {
  info: Portfolio
  stock_list: {
    data: {
      info: StockList
      list: StockOwned[]
    }
  }
}


export type PortfolioWithData = Portfolio & {
  market_value: number,
  performance_day: number,
  performance_year: number,
}

export type MatrixCell = {
  stock_a: string,
  stock_b: string,
  covariance: number,
  correlation: number
}

export type Friendship = {
  user_id: number,
  username?: string,
  email?: string,
}

export type FriendRequest = {
  user_id: number,
  username?: string,
  email?: string,
  status: string,
  created_at?: string,
}

export type UserReview  = {
  user_id: number,
  reviewer_name?: string,
  reviewer_email?: string,
  sl_id: number,
  content: string,
}