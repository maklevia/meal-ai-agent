export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCose: number) {
        super(message);
        this.statusCode = statusCose;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Request is invalid') {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Not authenticated') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403)
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}