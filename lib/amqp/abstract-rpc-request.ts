import uuid from 'uuid';

export abstract class AbstractRpcRequest {
	protected args: object;

	protected abstract readonly method: string;

	protected abstract readonly retriesLimit: number;

	protected priority = 0;

	private queue: string;

	private timeout: number;

	private readonly id: string;

	constructor() {
		this.id = uuid();
	}

	getId(): string {
		return this.id;
	}

	getMessageJSON(): string {
		return JSON.stringify({
			method: this.method,
			args: this.args,
		});
	}

	getMethod(): string {
		return this.method;
	}

	getArguments(): object {
		return this.args;
	}

	setQueue(queue: string): this {
		this.queue = queue;
		return this;
	}

	getQueue(): string {
		return this.queue;
	}

	setPriority(priority: number): this {
		this.priority = priority;
		return this;
	}

	getPriority(): number {
		return this.priority;
	}

	getRetriesLimit(): number {
		return this.retriesLimit;
	}

	setTimeout(timeout: number): this {
		this.timeout = timeout;
		return this;
	}

	getTimeout(): number {
		return this.timeout;
	}

	abstract setArguments(args: object);
}
