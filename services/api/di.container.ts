import 'reflect-metadata';
import { Container } from 'inversify';
import config from 'config';
import axios from 'axios';
import mongoose from 'mongoose';
import { ConfigInterface } from '../../config/config.interface';
import logger from '../../lib/logger';
import { LoggerInterface } from '../../lib/logger.interface';
import { modelAutoBind } from '../../lib/inversify-typegoose/model-auto-bind';
import { TaskAbstractFactoryInterface } from './task/task-abstract-factory.interface';
import { TaskAbstractFactory } from './task/task-abstract.factory';
import { TaskHandlerInterface } from './task/task-handler.interface';
import { CommentsByStrategyTaskHandler } from './comments-by-strategy/comments-by-strategy-task.handler';

import './comments-by-strategy/comments-by-strategy.controller';
import './auth/auth.controller';
import './task/task.controller';
import './vk-users/vk-user.controller';
import './comment-complain/comment-complain.controller';

import { AuthMiddleware } from './auth/auth.middleware';
import { CheckAndAddUserTaskHandler } from './vk-users/check-account/check-and-add-user-task.handler';
import { JoinToGroupTaskHandler } from './vk-users/join-to-group-task.handler';
import { CheckAllUsersTaskHandler } from './vk-users/check-account/check-all-users-task.handler';
import { TaskStrategyInterface } from './task/task-strategy.interface';
import { CompositeTaskStrategy } from './task/composite-task.strategy';
import { AtomicTaskStrategy } from './task/atomic-task.strategy';
import { SetCommentTaskHandler } from './comments/set-comment-task.handler';
import { CheckAccountTaskHandler } from './vk-users/check-account/check-account-task.handler';
import { FakeActivityTaskHandler } from './fake-activity/fake-activity-task.handler';
import { CommentComplainTaskHandler } from './comment-complain/comment-complain-task.handler';
import { CoverageImprovementTaskHandler } from './coverage-improvement/coverage-improvement-task.handler';

export function createContainer() {
	const container = new Container({
		autoBindInjectable: true,
		defaultScope: 'Singleton',
	});

	container.bind<ConfigInterface>('Config').toConstantValue(config);
	container.bind('Axios').toConstantValue(axios);
	container.bind<LoggerInterface>('Logger').toConstantValue(logger);
	container.bind<mongoose.Mongoose>('Mongoose').toConstantValue(mongoose);
	container.bind<TaskAbstractFactoryInterface>(TaskAbstractFactory).toSelf();
	container.bind(AuthMiddleware).toSelf();
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CommentsByStrategyTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CheckAndAddUserTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(JoinToGroupTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CheckAllUsersTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(SetCommentTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CheckAccountTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(FakeActivityTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CommentComplainTaskHandler);
	container.bind<TaskHandlerInterface>('TaskHandlerInterface').to(CoverageImprovementTaskHandler);
	container.bind<TaskStrategyInterface>('TaskStrategyInterface').to(CompositeTaskStrategy);
	container.bind<TaskStrategyInterface>('TaskStrategyInterface').to(AtomicTaskStrategy);

	modelAutoBind(container);
	return container;
}
