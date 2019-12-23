import { inject, injectable } from 'inversify';
import { VkUserService } from '../vk-users/vk-user.service';

@injectable()
export class VkUsersMetricsService {
	constructor(
		@inject('UMetrics') private readonly uMetrics,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
	) {}

	async storeCurrentValue() {
		const count = this.vkUserService.countActive();
		this.uMetrics.activeVkAccounts.inc(count);
	}
}
