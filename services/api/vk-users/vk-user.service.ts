import { ModelType } from '@typegoose/typegoose/lib/types';
import { random, shuffle, uniq } from 'lodash';
import { injectable } from 'inversify';
import moment from 'moment';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { VkUser } from './vk-user';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

@injectable()
export class VkUserService {
	constructor(@injectModel(VkUser) private readonly VkUsersModel: ModelType<VkUser>) {}

	async countActive(): Promise<number> {
		return this.VkUsersModel.count({ isActive: true });
	}

	async exists(login: string): Promise<boolean> {
		const count = await this.VkUsersModel.count({ login });
		return count > 0;
	}

	async updateSession(login: string, remixsid: string) {
		const user = await this.findByLogin(login);
		if (user.remixsid === remixsid) {
			return;
		}

		await this.VkUsersModel.update({ login }, { $set: { remixsid } });
	}

	async hasUserJoinedGroup(
		credentials: VkUserCredentialsInterface,
		groupId: string,
	): Promise<boolean> {
		const count = await this.VkUsersModel.count({
			login: credentials.login,
			groupIds: groupId,
		});

		return count > 0;
	}

	async addGroup(credentials: VkUserCredentialsInterface, groupId: string) {
		const user = await this.VkUsersModel.findOne({
			login: credentials.login,
		});

		user.groupIds = uniq([...user.groupIds, groupId]);
		await user.save();
	}

	async addUser(credentials: VkUserCredentialsInterface) {
		const newUser = new this.VkUsersModel();
		newUser.login = credentials.login;
		newUser.password = credentials.password;
		newUser.proxy = credentials.proxy;
		newUser.remixsid = credentials.remixsid;
		newUser.userAgent = credentials.userAgent;
		await newUser.save();
	}

	async findActive(count: number): Promise<VkUser[]> {
		const users = await this.VkUsersModel.find({ isActive: true })
			.lean()
			.exec();

		return shuffle(shuffle(users)).slice(0, count);
	}

	async getAllActive(): Promise<VkUser[]> {
		return this.VkUsersModel.find({
			isActive: true,
		})
			.lean()
			.exec();
	}

	async getRandom(exceptUser: VkUser): Promise<VkUser> {
		const query: { isActive: boolean; login?: object } = { isActive: true };

		if (exceptUser) {
			query.login = { $ne: exceptUser.login };
		}

		const users = await this.VkUsersModel.find(query)
			.lean()
			.exec();

		return users[random(0, users.length - 1)];
	}

	async getCredentialsByLogin(
		login: string,
		strictActive = false,
	): Promise<VkUserCredentialsInterface> {
		const filter: Partial<VkUser> = { login };
		if (strictActive) {
			filter.isActive = true;
		}

		const query = this.VkUsersModel.findOne(filter)
			.lean()
			.select({ login: 1, password: 1, userAgent: 1, proxy: 1, remixsid: 1, isActive: 1 });

		return query.exec();
	}

	async findByLogin(login: string): Promise<VkUser> {
		return this.VkUsersModel.findOne({ login })
			.lean()
			.exec();
	}

	async setInactive(login: string, reason: any) {
		const user = await this.VkUsersModel.findOne({ login });
		user.isActive = false;
		user.errorComment = reason;
		user.inactiveAt = moment();
		await user.save();
	}

	async setSensativeCredentials(login: string, remixsid: string, userAgent: string) {
		await this.VkUsersModel.update(
			{ login },
			{
				$set: { remixsid, userAgent },
			},
		);
	}
}
