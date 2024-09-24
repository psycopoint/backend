interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: Error;
}

export const createApiResponse = <T>(
  status: "success" | "error",
  data?: T,
  message?: string,
  error?: Error
): ApiResponse<T> => ({
  status,
  data,
  message,
  error,
});
