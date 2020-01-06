import { ObjectableInterface } from '../internal.types';

export class HandlerNotRegisterException extends Error implements ObjectableInterface {
	private readonly method: string;

	private readonly arguments: object;

	constructor(method: string, args: object) {
		super('There is no handler for such request');

		this.method = method;
		this.arguments = args;
	}

	toObject(): object {
		return {
			method: this.method,
			rpcArgs: this.arguments,
		};
	}
}
