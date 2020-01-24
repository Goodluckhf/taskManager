import 'reflect-metadata';
import { TaskAbstractFactory } from './task-abstract.factory';
import {
	ClassMapperInstanceTransformer,
	MapperTypeToClass,
} from './class-mapper-instance.transformer';
import { TaskHandlerInterface } from './task-handler.interface';

describe('TaskAbstractFactory', () => {
	class TaskHandler1 {
		handle() {}
	}

	class TaskHandler2 {
		handle() {}
	}

	let ctx: {
		taskHandler1Mock: TaskHandler1;
		taskHandler2Mock: TaskHandler2;
		taskAbstractFactory: TaskAbstractFactory;
		mapper: MapperTypeToClass<TaskHandlerInterface>;
	};

	beforeEach(() => {
		const taskHandler1Mock = new TaskHandler1();
		taskHandler1Mock.handle = jest.fn();

		const taskHandler2Mock = new TaskHandler2();
		taskHandler2Mock.handle = jest.fn();

		const taskAbstractFactory = new TaskAbstractFactory(
			[taskHandler1Mock, taskHandler2Mock],
			new ClassMapperInstanceTransformer(),
		);
		const mapper = {
			handlerName1: TaskHandler1,
			handlerName2: TaskHandler2,
		};

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		taskAbstractFactory.mapperModelTypeToTaskHandler = mapper;
		ctx = {
			mapper,
			taskHandler1Mock,
			taskHandler2Mock,
			taskAbstractFactory,
		};
	});

	it('Should create correct task', async () => {
		const handler = ctx.taskAbstractFactory.createTaskHandler('handlerName1');
		expect(handler).toBe(ctx.taskHandler1Mock);
	});

	it('Should create correct task 2', async () => {
		const handler = ctx.taskAbstractFactory.createTaskHandler('handlerName2');
		expect(handler).toBe(ctx.taskHandler2Mock);
	});
});
