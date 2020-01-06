import { ObjectableInterface } from '../internal.types';

export class TimeoutException extends Error implements ObjectableInterface {
	private readonly callbackId: string;

	private readonly arguments: object;

	constructor(id: string, args: object) {
		super('task Timeout');

		this.callbackId = id;
		this.arguments = args;
	}

	toObject(): object {
		return {
			callbackId: this.callbackId,
			rpcArgs: this.arguments,
		};
	}
}
