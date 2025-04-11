import { SERVER_URL } from "./config"

export const getFriends = async () => {
  // const res = await fetch(`${SERVER_URL}/api/friend`, {
  //   method: "GET",headers: {
  //     "Content-Type": "application/json",
  //     Accept: "application/json, text/plain, */*",
  //   },
  //   credentials: "include",
  // });

  // if (!res.ok) {
  //   const errorData = await res.json();
  //   throw new Error(
  //     errorData?.message || `Error: ${res.status} ${res.statusText}`
  //   );
  // }
  
  // return await res.json();
  return [
    {
      user1_id: 1,
      user1_name: "Kevin Lan",
      user1_email: "kevinlan416@gmail.com",
      user2_id: 2,
      user2_name: "Kevin 2",
      user2_email: "kevinlan3488@gmail.com",
      created_at: ""
    }
  ]
}


export const addFriend = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/friend`, {
    method: "POST",
    body: JSON.parse(data),
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

export const removeFriend = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/friend/${data?.id}`, {
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

export const getFriendRequests = async () => {
  // const res = await fetch(`${SERVER_URL}/api/friend/request`, {
  //   method: "GET",headers: {
  //     "Content-Type": "application/json",
  //     Accept: "application/json, text/plain, */*",
  //   },
  //   credentials: "include",
  // });

  // if (!res.ok) {
  //   const errorData = await res.json();
  //   throw new Error(
  //     errorData?.message || `Error: ${res.status} ${res.statusText}`
  //   );
  // }
  
  // return await res.json();
  return [
    {
      incoming_id: 2,
      incoming_name: "Kevin 2",
      incoming_email: "kevinlan3488@gmail.com",
      to_id: 1,
      to_name: "Kevin Lan",
      to_email: "kevinlan416@gmail.com",
      status: "pending"
    }
  ]
}

export const respondFriendRequest = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/friend/respond-request`, {
    method: "POST",
    body: JSON.parse(data),
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