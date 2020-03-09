import { inject, injectable } from 'inversify';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkUserService } from './vk-user.service';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

@injectable()
export class AuthExceptionCatcher {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async catch(
		error: Error & { code?: string },
		vkUserCredentials: VkUserCredentialsInterface,
	): Promise<boolean> {
		if (
			error.code === 'blocked' ||
			error.code === 'login_failed' ||
			error.code === 'phone_required' ||
			error.code === 'wrong date' ||
			error.code === 'captcha_failed'
		) {
			this.logger.warn({
				message: 'проблема с пользователем vk',
				code: error.code,
				login: vkUserCredentials.login,
			});

			await this.vkUserService.setInactive(vkUserCredentials.login, error);
			return true;
		}

		return false;
	}
}
