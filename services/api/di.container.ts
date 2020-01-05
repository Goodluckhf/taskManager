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

import { AuthMiddleware } from './auth/auth.middleware';
import { PostCommentRpcHandler } from '../taskConsumer/responses/post-comment-rpc.handler';
import { AbstractRpcHandler } from '../../lib/amqp/abstract-rpc-handler';
import { CheckAndAddUserTaskHandler } from './vk-users/check-and-add-user-task.handler';
import { CheckVkUserRpcHandler } from '../taskConsumer/responses/check-vk-user-rpc.handler';

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

	container.bind<AbstractRpcHandler>(AbstractRpcHandler).to(PostCommentRpcHandler);
	container.bind<AbstractRpcHandler>(AbstractRpcHandler).to(CheckVkUserRpcHandler);

	modelAutoBind(container);
	return container;
}
