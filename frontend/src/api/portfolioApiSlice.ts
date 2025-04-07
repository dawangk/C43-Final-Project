import { UploadArgs } from "@/components/file-upload";
import { SERVER_URL } from "./config"

export const createPortfolio = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio`, {
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

export const getPortfolios = async () => {
  const res = await fetch(`${SERVER_URL}/api/portfolio`, {
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

export const getPortfoliosWithData = async () => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/data`, {
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

export const getPortfolio = async (id: string) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/${id}`, {
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

export const getPortfolioWithData = async (id: string) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/data/${id}`, {
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

export const updatePortfolio = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/${data?.id}`, {
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

export const deletePortfolio = async (id: string) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/${id}`, {
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

export const modifyFunds = async (data: any) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/modifyFund/${data?.id}`, {
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

// Upload csv of recorded stock performance for a portfolio
export const uploadFile = async (args: UploadArgs) => {
  const res = await fetch(`${SERVER_URL}/api/portfolio/data/${args.port_id}`, {
    method: "POST",
    body: args.formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      `Error: ${res.status} ${res.statusText}`
    );
  }
  
  return await res.json();
}