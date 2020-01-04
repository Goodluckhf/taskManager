import { inject, injectable } from 'inversify';
import { UMetrics } from 'umetrics';
import { ProxyService } from '../proxies/proxy.service';
import { UmetricsWrapper } from './umetrics-wrapper';

@injectable()
export class ProxyMetricsService {
	private readonly uMetrics: UMetrics;

	constructor(
		@inject(ProxyService) private readonly proxyService: ProxyService,
		@inject(UmetricsWrapper) private readonly uMetricsWrapper: UmetricsWrapper,
	) {
		this.uMetrics = this.uMetricsWrapper.getUMetrics();
		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'activeProxies');
	}

	async storeCurrentValue() {
		const count = await this.proxyService.countActive();
		this.uMetrics.activeProxies.inc(count);
	}
}
