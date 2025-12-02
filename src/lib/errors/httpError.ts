// src/lib/errors/httpErrors.ts
import AppError from "./appError";

// 400 - Bad Request
export class BadRequest extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

// 401 - Unauthorized
export class Unauthorized extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// 403 - Forbidden
export class Forbidden extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

// 404 - Not Found
export class NotFound extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

// 409 - Conflict
export class Conflict extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

// 500 - Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
