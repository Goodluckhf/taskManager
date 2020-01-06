import supertest from 'supertest';
import 'reflect-metadata';
import { models } from '@typegoose/typegoose/lib/internal/data';
import { deleteModel } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { TYPE } from 'inversify-express-utils';
import { createContainer } from '../../di.container';
import { createApplication } from '../../create-application';
import { generateConfig } from '../fixtures/config';
import { Database } from '../../../../lib/inversify-typegoose/database';
import { getModelToken } from '../../../../lib/inversify-typegoose/get-model-token';
import { User } from '../../users/user';
import { createUser } from '../fixtures/user-factory';
import { AuthProviderMock } from '../fixtures/auth-provider.mock';
import { TaskMetricsService } from '../../metrics/task-metrics.service';
import { taskMetricsServiceMock } from '../mocks/task-metrics-service.mock';
import { TaskMetricsServiceInterface } from '../../metrics/task-metrics-service.interface';

describe('Common task API', () => {
	let ctx = null;

	beforeEach(async () => {
		const container = createContainer();
		container.rebind('Config').toConstantValue(generateConfig());
		container
			.bind<TaskMetricsServiceInterface>(TaskMetricsService)
			.toConstantValue(taskMetricsServiceMock);
		const database = container.get(Database);

		await database.connect();
		const UserModel = container.get<ModelType<User>>(getModelToken(User));
		const currentUser = await createUser(UserModel);
		ctx = {
			user: currentUser,
			app: supertest(createApplication(container)),
			container,
			database,
		};
		container.rebind(TYPE.AuthProvider).toConstantValue(new AuthProviderMock(currentUser));
	});

	afterEach(async () => {
		[...models.keys()].forEach(deleteModel);
		await ctx.database.disconnect();
	});

	it('should delete', async () => {
		const {
			body: { data },
		} = await ctx.app
			.post('/api/comments-by-strategy')
			.send({
				postLink: 'testLink',
				commentsStrategy: [{ userFakeId: 0, text: 'text' }],
			})
			.expect(200);

		await ctx.app.delete(`/api/task/${data._id}`).expect(200);
		const { body } = await ctx.app.get('/api/comments-by-strategy').expect(200);
		expect(body.data.length).toBe(0);
	});
});
