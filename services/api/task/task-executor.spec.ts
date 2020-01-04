import 'reflect-metadata';
import { TaskExecutor } from './task-executor';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { loggerMock } from '../tests/ts/fixtures/logger.mock';
import { TaskServiceInterface } from './task-service.interface';
import { createTask } from '../tests/ts/fixtures/task-factory';
import { Mocked } from '../tests/ts/types';
import { taskMetricsServiceMock } from '../tests/ts/mocks/task-metrics-service.mock';

describe('TaskExecutor', () => {
	let ctx: {
		taskExecutor: TaskExecutor;
		taskAbstractionFactoryMock: Mocked<TaskAbstractFactoryInterface>;
		taskServiceMock: Mocked<TaskServiceInterface>;
	};
	beforeEach(() => {
		const taskAbstractionFactoryMock: Mocked<TaskAbstractFactoryInterface> = {
			createTaskHandler: jest.fn(),
		};

		const taskServiceMock: Mocked<TaskServiceInterface> = {
			deleteOwnedByUser: jest.fn(),
			getActive: jest.fn(),
			finish: jest.fn(),
			finishWithError: jest.fn(),
			setPending: jest.fn(),
		};

		const taskExecutor = new TaskExecutor(
			taskAbstractionFactoryMock,
			taskServiceMock,
			loggerMock,
			taskMetricsServiceMock,
		);

		ctx = {
			taskExecutor,
			taskServiceMock,
			taskAbstractionFactoryMock,
		};
	});

	it('Should set pending and finish task without error', async () => {
		ctx.taskAbstractionFactoryMock.createTaskHandler.mockReturnValue({ async handle() {} });
		await ctx.taskExecutor.execute(createTask());

		expect(ctx.taskServiceMock.setPending).toBeCalled();
		expect(ctx.taskServiceMock.finish).toBeCalled();
		expect(ctx.taskServiceMock.finishWithError).not.toBeCalled();
	});

	it('Should set pending and finish task with error if something failed', async () => {
		ctx.taskAbstractionFactoryMock.createTaskHandler.mockReturnValue({
			async handle() {
				throw new Error('failed');
			},
		});
		await ctx.taskExecutor.execute(createTask());

		expect(ctx.taskServiceMock.setPending).toBeCalled();
		expect(ctx.taskServiceMock.finish).not.toBeCalled();
		expect(ctx.taskServiceMock.finishWithError).toBeCalled();
	});
});
