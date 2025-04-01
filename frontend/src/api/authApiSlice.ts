import { SERVER_URL } from "./config"

export const signup = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/auth/signup`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }

  return await res.json();
}

export const login = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/auth/login`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  
  return await res.json();
}

export const logout = async () => {
  const res = await fetch(`${SERVER_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  
  return await res.json();
}

export const me = async () => {
  const res = await fetch(`${SERVER_URL}/auth/me`, {
    method: "POST",headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  
  return await res.json();
}