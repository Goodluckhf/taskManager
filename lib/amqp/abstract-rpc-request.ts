export abstract class AbstractRpcRequest {
	protected args: object;

	protected abstract readonly method: string;

	protected abstract readonly retriesLimit: number;

	private queue: string;

	private timeout: number;

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
