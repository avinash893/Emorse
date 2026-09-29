import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";
import { env } from "./env";
import type { ApiEnvelope } from "@/types";

const api = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

api.interceptors.request.use(async (config) => {
  if (!tokenGetter) return config;

  const token = await tokenGetter();

  if (token) {
    config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  try {
    const response = await api.get<ApiEnvelope<T>>(url, config);

    if (response.data.status === "error") {
      throw new Error(response.data.errors?.[0]?.message || "Request failed");
    }

    return response.data.data as T;
  } catch (error) {
    console.error("API GET error:", error);
    throw new Error(getErrorMessage(error), { cause: error });
  }
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong";
}

export async function apiPost<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
) {
  try {
    const response = await api.post<ApiEnvelope<TResponse>>(url, body, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.message || "Request failed");
    }

    return response.data.data as TResponse;
  } catch (error) {
    console.error("API POST error:", error);
    throw new Error(getErrorMessage(error), { cause: error });
  }
}

export default api;
