import supertest from 'supertest';
import { models } from '@typegoose/typegoose/lib/internal/data';
import { deleteModel } from '@typegoose/typegoose';
import { createContainer } from '../../di.container';
import { generateConfig } from '../fixtures/config';
import { Database } from '../../../../lib/inversify-typegoose/database';
import { createApplication } from '../../create-application';
import { TaskMetricsServiceInterface } from '../../metrics/task-metrics-service.interface';
import { TaskMetricsService } from '../../metrics/task-metrics.service';
import { taskMetricsServiceMock } from '../mocks/task-metrics-service.mock';

describe('Auth API', () => {
	let ctx;

	beforeEach(async () => {
		const container = createContainer();
		container.rebind('Config').toConstantValue(generateConfig());
		container
			.bind<TaskMetricsServiceInterface>(TaskMetricsService)
			.toConstantValue(taskMetricsServiceMock);
		const database = container.get(Database);

		await database.connect();
		ctx = {
			app: supertest(createApplication(container)),
			container,
			database,
		};
	});

	afterEach(async () => {
		[...models.keys()].forEach(deleteModel);
		await ctx.database.disconnect();
	});

	describe('registration', () => {
		beforeEach(async () => {
			const {
				body: { data: registrationResult },
			} = await ctx.app
				.post('/api/auth/register')
				.send({ email: 'test@test.ru', password: '123' })
				.expect(200);

			ctx.registrationResult = registrationResult;
		});

		it('Should login after registration', async () => {
			const {
				body: { data: loginResult },
			} = await ctx.app
				.post('/api/auth/login')
				.send({ email: 'test@test.ru', password: '123' })
				.expect(200);

			expect(ctx.registrationResult).toEqual(loginResult);
		});

		it('Should not login if email is incorrect', async () => {
			await ctx.app
				.post('/api/auth/login')
				.send({ email: 'test1@test.ru', password: '123' })
				.expect(401);
		});

		it('Should not register one more user', async () => {
			await ctx.app
				.post('/api/auth/register')
				.send({ email: 'test@test.ru', password: '123' })
				.expect(400);
		});
	});
});
