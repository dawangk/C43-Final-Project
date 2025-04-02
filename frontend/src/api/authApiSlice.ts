import { SERVER_URL } from "./config"

export const signup = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/auth/signup`, {
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

export const login = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/auth/login`, {
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

export const logout = async () => {
  const res = await fetch(`${SERVER_URL}/auth/logout`, {
    method: "POST",
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

export const me = async () => {
  const res = await fetch(`${SERVER_URL}/auth/me`, {
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