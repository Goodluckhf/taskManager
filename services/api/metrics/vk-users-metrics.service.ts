import { inject, injectable } from 'inversify';
import { UMetrics } from 'umetrics';
import { VkUserService } from '../vk-users/vk-user.service';
import { UmetricsWrapper } from './umetrics-wrapper';

@injectable()
export class VkUsersMetricsService {
	private readonly uMetrics: UMetrics;

	constructor(
		@inject(UmetricsWrapper) private readonly uMetricsWrapper: UmetricsWrapper,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
	) {
		this.uMetrics = this.uMetricsWrapper.getUMetrics();
		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'activeVkAccounts');
	}

	async storeCurrentValue() {
		const count = await this.vkUserService.countActive();
		this.uMetrics.activeVkAccounts.inc(count);
	}
}
