// @flow

export interface Jsonable {
	toJson(): string
}

export type objectErrorT = {
	success: boolean,
	message: string,
	status: number,
};

export interface Objectable {
	toObject(): objectErrorT
}

export default class BaseApiError extends Error implements Jsonable, Objectable {
	status : number;
	success: boolean;
	
	constructor(message: string, status: number) {
		super(message);
		this.status  = status || 400;
		this.success = false;
	}
	
	toObject(): objectErrorT {
		return {
			success: this.success,
			message: this.message,
			status : this.status,
		};
	}
	
	toJson(): string {
		return JSON.stringify(this.toObject());
	}
}
