import { BaseHttpController, controller, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { AuthMiddleware } from '../auth/auth.middleware';
import { VkUserService } from './vk-user.service';

@controller('/api/vk-users')
export class VkUserController extends BaseHttpController {
	@inject(VkUserService) private readonly vkUserService: VkUserService;

	@httpGet('/active', AuthMiddleware)
	async getActiveCount() {
		return this.json({ success: true, data: await this.vkUserService.countActive() }, 200);
	}
}
