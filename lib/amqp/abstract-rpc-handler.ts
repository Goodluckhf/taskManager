import { injectable } from 'inversify';

@injectable()
export abstract class AbstractRpcHandler {
	protected abstract method: string;

	getMethod(): string {
		return this.method;
	}

	abstract async handle(args: object): Promise<object>;
}
