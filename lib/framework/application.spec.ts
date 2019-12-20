import { Container } from 'inversify';
import supertest from 'supertest';
import { Server } from 'http';
import { KoaApplication } from './koa-application';
import { ControllerInterface } from './controller.interface';
import { ControllerA } from './__fixtures__/controller-a';
import { ControllerB } from './__fixtures__/controller-b';
import { ControllerC } from './__fixtures__/controller-c';

describe('Application', () => {
	let ctx: {
		application: KoaApplication;
		container: Container;
		server: Server;
	};

	beforeEach(() => {
		const container = new Container({
			autoBindInjectable: true,
			defaultScope: 'Singleton',
		});

		container.bind<ControllerInterface>('Controller').to(ControllerA);
		const application = container.get(KoaApplication);

		ctx = {
			application,
			container,
			server: application.getHttpServer().listen(),
		};
	});

	afterEach(() => {
		ctx.server.close();
	});

	it('Should not throw error when start', () => {
		expect(ctx.application).toBeInstanceOf(KoaApplication);
	});

	it('Should add route as controller', async () => {
		await supertest(ctx.server)
			.get('index')
			.expect(200, 10);
	});

	it('Should use middleware in controller', async () => {
		ctx.container.bind<ControllerInterface>('Controller').to(ControllerB);

		await supertest(ctx.server)
			.get('index')
			.expect(200, 20);
	});

	it('Should use several middlewares in controller', async () => {
		ctx.container.bind<ControllerInterface>('Controller').to(ControllerC);

		await supertest(ctx.server)
			.get('index')
			.expect(200, 30);
	});
});
