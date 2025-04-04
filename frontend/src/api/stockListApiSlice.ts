import { SERVER_URL } from "./config"

export const createStockList = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/stocklist`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }

  return await res.json();
}

export const updateStockEntry = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/stocklist/${data?.id}`, {
    method: "POST",
    body: JSON.stringify(data?.body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }

  return await res.json();
}

export const getStockLists = async () => {
  const res = await fetch(`${SERVER_URL}/api/stocklist`, {
    method: "GET",headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }
  
  return await res.json();
}

export const getStockList = async (id: string) => {
  const res = await fetch(`${SERVER_URL}/api/stocklist/${id}`, {
    method: "GET",headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }
  
  return await res.json();
}

export const updateStockList = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/stocklist/${data?.id}`, {
    method: "PUT",
    body: JSON.stringify(data?.body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }

  return await res.json();
}

/* If provide symbol in body then deletes an entry. Otherwise deletes entire list.*/
export const deleteStockList = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/stocklist/${data?.id}`, {
    method: "DELETE",
    body: JSON.stringify(data?.body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData?.message || `Error: ${res.status} ${res.statusText}`
    );
  }

  return await res.json();
}