// lib/api-response.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const successResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (
  error: string,
  code?: string
): ApiResponse => {
  return {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  };
};

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: errorResponse(error.message, error.code),
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: errorResponse(error.message, "INTERNAL_ERROR"),
    };
  }

  return {
    statusCode: 500,
    body: errorResponse("Unknown error occurred", "UNKNOWN_ERROR"),
  };
};
