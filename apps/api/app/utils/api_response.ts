export class ApiResponse {
  static success<T>(data?: T, message?: string, meta?: Record<string, unknown>) {
    return {
      success: true,
      data,
      message,
      ...(meta !== undefined ? { meta } : {}),
    }
  }
  static failure<T>(data?: T, message?: string) {
    return {
      success: false,
      data,
      message,
    }
  }
}
