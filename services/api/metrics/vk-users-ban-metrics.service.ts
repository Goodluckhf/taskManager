import { inject, injectable } from 'inversify';
import { UMetrics } from 'umetrics';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UmetricsWrapper } from './umetrics-wrapper';
import { VkUserService } from '../vk-users/vk-user.service';
import { CommentsByStrategyTask } from '../comments-by-strategy/comments-by-strategy-task';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { JoinToGroupTask } from '../vk-users/join-to-group.task';
import { CoverageImprovementTask } from '../coverage-improvement/coverage-improvement.task';
import { VkUserBanMetricsInterface } from './vk-user-ban-metrics.interface';

@injectable()
export class VkUsersBanMetricsService implements VkUserBanMetricsInterface {
	private readonly uMetrics: UMetrics;

	constructor(
		@inject(UmetricsWrapper) private readonly uMetricsWrapper: UmetricsWrapper,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@injectModel(CommentsByStrategyTask)
		private readonly CommentsByStrategyTaskModel: ModelType<CommentsByStrategyTask>,
		@injectModel(JoinToGroupTask)
		private readonly JoinToGroupTaskModel: ModelType<JoinToGroupTask>,
		@injectModel(CoverageImprovementTask)
		private readonly CoverageImprovementTaskModel: ModelType<CoverageImprovementTask>,
	) {
		this.uMetrics = this.uMetricsWrapper.getUMetrics();
		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'botsBannedCount', {
			labels: ['tags'],
		});
		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'botTasksCount', {
			labels: ['task_type'],
		});
	}

	async increaseBannedBot(login: string) {
		const vkUser = await this.vkUserService.findByLogin(login);
		this.uMetrics.botsBannedCount.inc(1, { tags: vkUser.tags.join('_') });
		const commentsByStrategyTasksCount = await this.CommentsByStrategyTaskModel.count({
			vkUserLogins: login,
		});
		const joinToGroupTasksCount = await this.JoinToGroupTaskModel.count({
			'vkUserCredentials.login': login,
		});

		const coverageImprovementTasksCount = await this.CoverageImprovementTaskModel.count({
			login,
		});

		this.uMetrics.botTasksCount.inc(commentsByStrategyTasksCount, {
			task_type: 'CommentsByStrategyTask',
		});

		this.uMetrics.botTasksCount.inc(joinToGroupTasksCount, {
			task_type: 'JoinToGroupTask',
		});

		this.uMetrics.botTasksCount.inc(coverageImprovementTasksCount, {
			task_type: 'CoverageImprovementTask',
		});
	}
}
