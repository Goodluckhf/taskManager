import {
	controller,
	httpPost,
	BaseHttpController,
	requestBody,
	httpGet,
	principal,
	interfaces,
} from 'inversify-express-utils';
import { plainToClass } from 'class-transformer';
import { inject } from 'inversify';
import { validateSync } from 'class-validator';
import { AuthMiddleware } from '../auth/auth.middleware';
import { TaskCreationDto } from './dto/task-creation.dto';
import { CommentByStrategyTaskInterface } from './comment-by-strategy-task.interface';
import { CommentByStrategyApi } from './comment-by-strategy-api';
import { ValidationException } from '../exceptions/validation.exception';
import { User } from '../users/user';

@controller('/api')
export class CommentsByStrategyController extends BaseHttpController {
	@inject(CommentByStrategyApi) private readonly commentByStrategyApi: CommentByStrategyApi;

	@httpPost('/comments-by-strategy', AuthMiddleware)
	async createTask(@requestBody() body, @principal() principalUser: interfaces.Principal) {
		const taskCreationDto = plainToClass<CommentByStrategyTaskInterface, any>(
			TaskCreationDto,
			body,
		);

		const errors = validateSync(taskCreationDto, { validationError: { target: false } });

		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.commentByStrategyApi.create(
					principalUser.details as User,
					taskCreationDto,
				),
			},
			200,
		);
	}

	@httpGet('/comments-by-strategy', AuthMiddleware)
	async list(@principal() principalUser: interfaces.Principal) {
		const data = await this.commentByStrategyApi.getOwnedByUser(principalUser.details);

		return this.json(
			{
				success: true,
				data,
			},
			200,
		);
	}
}
