import { inject, injectable } from 'inversify';
import { ProxyService } from '../proxies/proxy.service';

@injectable()
export class ProxyMetricsService {
	constructor(
		@inject(ProxyService) private readonly proxyService: ProxyService,
		@inject('UMetrics') private readonly uMetrics,
	) {}

	async storeCurrentValue() {
		const count = await this.proxyService.countActive();
		this.uMetrics.activeProxies.inc(count);
	}
}
