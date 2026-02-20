export enum ErrorCode {
	NotFound = 'NOT_FOUND',
	NotInitialized = 'NOT_INITIALIZED',
	Unauthorized = 'UNAUTHORIZED',
	BadRequest = 'BAD_REQUEST',
	LlmError = 'LLM_ERROR',
}

export class CoreError extends Error {
	constructor(
		message: string,
		public readonly code: ErrorCode,
	) {
		super(message);
		this.name = 'CoreError';
	}
}

export class NotFoundError extends CoreError {
	constructor(message: string) {
		super(message, ErrorCode.NotFound);
		this.name = 'NotFoundError';
	}
}

export class NotInitializedError extends CoreError {
	constructor(message: string) {
		super(message, ErrorCode.NotInitialized);
		this.name = 'NotInitializedError';
	}
}

export class UnauthorizedError extends CoreError {
	constructor(message: string) {
		super(message, ErrorCode.Unauthorized);
		this.name = 'UnauthorizedError';
	}
}

export class BadRequestError extends CoreError {
	constructor(message: string) {
		super(message, ErrorCode.BadRequest);
		this.name = 'BadRequestError';
	}
}

export class LlmError extends CoreError {
	constructor(
		message: string,
		public readonly statusCode?: number,
	) {
		super(message, ErrorCode.LlmError);
		this.name = 'LlmError';
	}
}
