import { inject, injectable } from 'inversify';
import { LoggerInterface } from './logger.interface';

@injectable()
class GracefulStop {
	private readonly waitings: Map<string, boolean>;

	private stopping: boolean;

	constructor(@inject('Logger') private readonly logger: LoggerInterface) {
		this.waitings = new Map();
		this.stopping = false;
	}

	/**
	 * @return {boolean}
	 */
	get isStopping(): boolean {
		return this.stopping;
	}

	/**
	 * Регистрирует ожидателя
	 * @param {String} key
	 */
	setWaitor(key: string): void {
		this.waitings.set(key, false);
	}

	/**
	 * Устанваливает ожидателя готовым к остановке
	 */
	setReady(key: string): void {
		this.waitings.set(key, true);
	}

	/**
	 * Не готов к выходу
	 */
	setProcessing(key: string): void {
		this.waitings.set(key, false);
	}

	stop(status = 0) {
		this.logger.info('Start graceful stop');
		this.stopping = true;
		setInterval(() => {
			for (const ready of this.waitings.values()) {
				if (!ready) {
					return;
				}
			}

			this.logger.info('Successful graceful stop');
			this.forceStop(200, status);
		}, 1000);
	}

	forceStop(ms = 1000, status = 1) {
		this.stopping = true;
		this.logger.info('Force stopping');
		setTimeout(() => {
			process.exit(status);
		}, ms);
	}
}

export default GracefulStop;
