import { SERVER_URL } from "./config"

export const getFriends = async () => {
  const res = await fetch(`${SERVER_URL}/friend`, {
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


export const addFriend = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/friend/`, {
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

export const removeFriend = async (id: number) => {
  const res = await fetch(`${SERVER_URL}/friend/${id}`, {
    method: "DELETE",
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

export const getIncomingFriendRequests = async () => {
  const res = await fetch(`${SERVER_URL}/friend/incoming`, {
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

export const getOutgoingFriendRequests = async () => {
  const res = await fetch(`${SERVER_URL}/friend/outgoing`, {
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

export const respondFriendRequest = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/friend/update/${data?.id}`, {
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