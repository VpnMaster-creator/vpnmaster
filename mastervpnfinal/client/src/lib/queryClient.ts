import { QueryClient } from "@tanstack/react-query";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  on401?: "throw" | "returnNull";
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  method: RequestMethod,
  url: string,
  data?: unknown,
  extraHeaders?: Record<string, string>
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response;
}

export function getQueryFn(options: FetchOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    try {
      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.status === 401 && options.on401 === "returnNull") {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };
}