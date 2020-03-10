import { inject, injectable } from 'inversify';
import { UMetrics } from 'umetrics';
import { VkUserService } from '../vk-users/vk-user.service';
import { UmetricsWrapper } from './umetrics-wrapper';
import { tagsEnum } from '../vk-users/tags-enum.constant';

@injectable()
export class VkUsersMetricsService {
	private readonly uMetrics: UMetrics;

	constructor(
		@inject(UmetricsWrapper) private readonly uMetricsWrapper: UmetricsWrapper,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
	) {
		this.uMetrics = this.uMetricsWrapper.getUMetrics();
		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'activeVkAccounts', {
			labels: ['tag'],
		});
	}

	async storeCurrentValue() {
		const femaleCount = await this.vkUserService.countActive([tagsEnum.female]);
		const femaleCompleteCount = await this.vkUserService.countActive([
			tagsEnum.female,
			tagsEnum.complete,
		]);
		const male = await this.vkUserService.countActive([tagsEnum.male]);
		const broot = await this.vkUserService.countActive([tagsEnum.broot]);
		this.uMetrics.activeVkAccounts.set(femaleCount, { tag: 'female' });
		this.uMetrics.activeVkAccounts.set(broot, { tag: 'broot' });
		this.uMetrics.activeVkAccounts.set(femaleCompleteCount, { tag: 'female_complete' });
		this.uMetrics.activeVkAccounts.set(male, { tag: 'male' });
	}
}
