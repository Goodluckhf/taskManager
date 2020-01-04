import { inject, injectable } from 'inversify';
import { UMetrics, PullTransport } from 'umetrics';
import { LoggerInterface } from '../../../lib/logger.interface';
import { ConfigInterface } from '../../../config/config.interface';

@injectable()
export class UmetricsWrapper {
	private readonly uMetrics: UMetrics;

	constructor(
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject('Config') private readonly config: ConfigInterface,
	) {
		const transport = new PullTransport(logger, config.get('uMetrics.port'));
		this.uMetrics = new UMetrics(transport, { prefix: 'umetrics' });
	}

	start() {
		this.uMetrics.start();
	}

	getUMetrics(): UMetrics {
		return this.uMetrics;
	}
}
