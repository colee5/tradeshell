export class CoreError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = 'CoreError';
	}
}

export class NotFoundError extends CoreError {
	constructor(message: string) {
		super(message, 'NOT_FOUND');
		this.name = 'NotFoundError';
	}
}

export class UnauthorizedError extends CoreError {
	constructor(message: string) {
		super(message, 'UNAUTHORIZED');
		this.name = 'UnauthorizedError';
	}
}

export class BadRequestError extends CoreError {
	constructor(message: string) {
		super(message, 'BAD_REQUEST');
		this.name = 'BadRequestError';
	}
}
