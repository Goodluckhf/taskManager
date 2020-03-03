import {
	BaseHttpController,
	controller,
	httpPost,
	interfaces,
	principal,
	requestBody,
} from 'inversify-express-utils';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { inject } from 'inversify';
import { AuthMiddleware } from '../auth/auth.middleware';
import { CreationForAllDto } from './creation-for-all.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { CoverageImprovementTaskService } from './coverage-improvement-task.service';
import { User } from '../users/user';

@controller('/api')
export class CoverageImprovementController extends BaseHttpController {
	@inject(CoverageImprovementTaskService)
	private readonly coverageImprovementTaskService: CoverageImprovementTaskService;

	@httpPost('/coverage-improvement-task', AuthMiddleware)
	async createTask(@requestBody() body, @principal() principalUser: interfaces.Principal) {
		const taskCreationDto = plainToClass(CreationForAllDto, body);
		const errors = validateSync(taskCreationDto, { validationError: { target: false } });

		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.coverageImprovementTaskService.createForUsers(
					principalUser.details as User,
					taskCreationDto.tags,
				),
			},
			200,
		);
	}
}
