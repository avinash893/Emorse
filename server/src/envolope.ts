export type ApiEnvelope<T> = {
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  error?: Array<{ message: string; code?: string }>;
};

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> {
  return {
    status: "success",
    data,
    meta,
  };
}

export function fail<T>(message: string, code?: string): ApiEnvelope<null> {
  return {
    status: "error",
    data: null,
    error: [{ message, code }],
  };
}
