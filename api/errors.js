// @flow

export interface Jsonable {
	toJson(): string
}

export type objectErrorT = {
	success: boolean,
	message: string,
};

export interface Objectable {
	toObject(): objectErrorT
}

export class BaseApiError extends Error implements Jsonable, Objectable {
	toObject(): objectErrorT {
		return {
			success: false,
			message: this.message,
		};
	}
	
	toJson(): string {
		return JSON.stringify(this.toObject());
	}
}


export class NotFoundError extends BaseApiError {
	constructor() {
		super('Nothing found');
	}
}
