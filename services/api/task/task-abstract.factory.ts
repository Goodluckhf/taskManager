import { inject, injectable, multiInject } from 'inversify';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { TaskHandlerInterface } from './task-handler.interface';
import { CommentsByStrategyTaskHandler } from '../comments-by-strategy/comments-by-strategy-task.handler';
import { CheckAndAddUserTaskHandler } from '../vk-users/check-account/check-and-add-user-task.handler';
import { JoinToGroupTaskHandler } from '../vk-users/join-to-group-task.handler';
import { CheckAllUsersTaskHandler } from '../vk-users/check-account/check-all-users-task.handler';
import {
	ClassMapperInstanceTransformer,
	MapperToInstance,
	MapperTypeToClass,
} from './class-mapper-instance.transformer';
import { SetCommentTaskHandler } from '../comments/set-comment-task.handler';
import { CheckAccountTaskHandler } from '../vk-users/check-account/check-account-task.handler';
import { FakeActivityTaskHandler } from '../fake-activity/fake-activity-task.handler';
import { CommentComplainTaskHandler } from '../comment-complain/comment-complain-task.handler';
import { CoverageImprovementTaskHandler } from '../coverage-improvement/coverage-improvement-task.handler';

@injectable()
export class TaskAbstractFactory implements TaskAbstractFactoryInterface {
	private mapper: MapperToInstance<TaskHandlerInterface>;

	private readonly mapperModelTypeToTaskHandler: MapperTypeToClass<TaskHandlerInterface> = {
		CommentsByStrategyTask: CommentsByStrategyTaskHandler,
		SetCommentTask: SetCommentTaskHandler,
		CheckAndAddUserTask: CheckAndAddUserTaskHandler,
		JoinToGroupTask: JoinToGroupTaskHandler,
		CheckAllUsersTask: CheckAllUsersTaskHandler,
		CheckAccountTask: CheckAccountTaskHandler,
		FakeActivityTask: FakeActivityTaskHandler,
		CommentComplainTask: CommentComplainTaskHandler,
		CoverageImprovementTask: CoverageImprovementTaskHandler,
	};

	constructor(
		@multiInject('TaskHandlerInterface') private readonly taskHandlers: TaskHandlerInterface[],
		@inject(ClassMapperInstanceTransformer)
		private readonly classMapperInstanceTransformer: ClassMapperInstanceTransformer,
	) {}

	createTaskHandler(type: string): TaskHandlerInterface {
		if (!this.mapper) {
			this.mapper = this.classMapperInstanceTransformer.transform(
				this.taskHandlers,
				this.mapperModelTypeToTaskHandler,
			);
		}
		const taskHandler = this.mapper[type];
		if (!taskHandler) {
			throw new Error('There is no registered taskHandler for this type');
		}

		return taskHandler;
	}
}
