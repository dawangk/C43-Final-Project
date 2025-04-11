import { SERVER_URL } from "./config";

// id is sl_id
export const getUsersShared = async (id: string) => {
  const res = await fetch(`${SERVER_URL}/share/${id}`, {
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

// id is sl_id
// email in body
export const shareStockList = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/share/${data.id}`, {
    method: "POST",
    body: JSON.stringify(data.body),
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

export const getSharedStockListsWithData = async () => {
  const res = await fetch(`${SERVER_URL}/api/stocklist/data?type=shared`, {
    method: "GET",
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