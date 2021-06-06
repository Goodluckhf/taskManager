import { BaseHttpController, controller, httpPut, requestBody } from 'inversify-express-utils';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { inject } from 'inversify';
import { AuthMiddleware } from '../auth/auth.middleware';
import { UserAgentsDto } from './user-agents.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { UserAgentService } from './user-agent.service';
import { UserAgentServiceInterface } from './user-agent-service.interface';

@controller('/api')
export class UserAgentController extends BaseHttpController {
	@inject(UserAgentService) private readonly userAgentService: UserAgentServiceInterface;

	@httpPut('/user-agents', AuthMiddleware)
	async updateUserAgents(@requestBody() dto: any) {
		const userAgentsDto = plainToClass(UserAgentsDto, dto);
		const errors = validateSync(userAgentsDto, { validationError: { target: false } });
		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.userAgentService.update(userAgentsDto.userAgents),
			},
			200,
		);
	}
}
