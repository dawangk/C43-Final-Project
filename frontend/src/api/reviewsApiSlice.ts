import { SERVER_URL } from "./config";

export const getReviews = async (sl_id: string) => {
  // const res = await fetch(`${SERVER_URL}/api/review/${sl_id}`, {
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
      user_id: 2,
      reviewer_name: "Kevin 2",
      reviewer_email: "kevinlan3488@gmail.com",
      sl_id: 1,
      content: "Test review."
    }
  ]
}

export const updateReview = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/review/${data?.id}`, {
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


export const deleteReview = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/review`, {
    method: "DELETE",
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

export const createReview = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/review`, {
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