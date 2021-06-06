import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import bluebird from 'bluebird';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { getRandom } from '../../../lib/helper';
import { UserAgentServiceInterface } from './user-agent-service.interface';
import { UserAgent } from './user-agent';
import { LoggerInterface } from '../../../lib/logger.interface';

@injectable()
export class UserAgentService implements UserAgentServiceInterface {
	constructor(
		@injectModel(UserAgent) private readonly UserAgentModel: ModelType<UserAgent>,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async getRandomMany(count: number): Promise<string[]> {
		const allUserAgents = await this.UserAgentModel.find({
			isActive: true,
		})
			.lean()
			.exec();

		if (allUserAgents.length === 0) {
			return [];
		}

		return Array.from({ length: count }).map(() => {
			const random = getRandom(0, allUserAgents.length - 1);
			return allUserAgents[random].userAgent;
		});
	}

	async getRandom(): Promise<string> {
		const [userAgent] = await this.getRandomMany(1);
		return userAgent;
	}

	async countActive(): Promise<number> {
		return this.UserAgentModel.count({
			isActive: true,
		});
	}

	async setInactive(userAgent: string): Promise<void> {
		await this.UserAgentModel.update(
			{
				userAgent,
			},
			{
				$set: { isActive: false },
			},
		);
	}

	async update(userAgents: string[]): Promise<void> {
		const existedUserAgents = await this.UserAgentModel.find({
			userAgent: { $in: userAgents },
		})
			.lean()
			.exec();

		const existedMap = existedUserAgents.reduce((map, userAgent) => {
			map[userAgent.userAgent] = true;
			return map;
		}, {});

		const filteredUserAgentsToInsert = userAgents.filter(userAgent => {
			return !existedMap[userAgent];
		});

		const userAgentsToInsert = filteredUserAgentsToInsert.map(userAgent => {
			const userAgentDocument = new this.UserAgentModel();
			userAgentDocument.userAgent = userAgent;
			userAgentDocument.isActive = true;
			return userAgentDocument;
		});

		this.logger.info({
			message: 'Добавляем новые user agents',
			userAgents: filteredUserAgentsToInsert,
		});

		await bluebird.map(userAgentsToInsert, doc => doc.save(), { concurrency: 10 });
	}
}
