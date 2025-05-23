import {SERVER_URL} from './config';

export const getStocks =
    async (search: string) => {
  const res = await fetch(`${SERVER_URL}/api/stock?search=${search}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
        errorData?.message || `Error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

// Gets most recent info of a stock
export const getStock =
    async (symbol: string, port_id?: number) => {
  const query = port_id !== undefined ? `?port_id=${port_id}` : '';
  console.log(port_id);
  const res = await fetch(`${SERVER_URL}/api/stock/${symbol}${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
        errorData?.message || `Error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}


// Gets history of a stock
export const getStockHistory =
    async (symbol: string, period: string, id?: string) => {
  const res = await fetch(
      `${SERVER_URL}/api/stock/history/${symbol}/${id ?? ''}?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        credentials: 'include',
      });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
        errorData?.message || `Error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

// Gets prediction of a stock
export const getStockPrediction =
    async (symbol: string, period: string, id?: string) => {
  const res = await fetch(
      `${SERVER_URL}/api/stock/prediction/${symbol}/${id ?? ''}?period=${
          period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        credentials: 'include',
      });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
        errorData?.message || `Error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}