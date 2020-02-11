import {
	BaseHttpController,
	controller,
	httpPost,
	interfaces,
	principal,
	requestBody,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthMiddleware } from '../auth/auth.middleware';
import { ValidationException } from '../exceptions/validation.exception';
import { User } from '../users/user';
import { CommentComplainTaskService } from './comment-complain-task.service';
import { CommentComplainCreationDto } from './comment-complain-creation.dto';

@controller('/api')
export class CommentComplainController extends BaseHttpController {
	@inject(CommentComplainTaskService)
	private readonly commentComplainTaskService: CommentComplainTaskService;

	@httpPost('/comment-complain', AuthMiddleware)
	async createTask(@requestBody() body, @principal() principalUser: interfaces.Principal) {
		const taskCreationDto = plainToClass<CommentComplainCreationDto, any>(
			CommentComplainCreationDto,
			body,
		);

		const errors = validateSync(taskCreationDto, { validationError: { target: false } });

		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.commentComplainTaskService.createTasks(
					principalUser.details as User,
					taskCreationDto,
				),
			},
			200,
		);
	}
}
