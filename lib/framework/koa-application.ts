import { injectable, multiInject, optional } from 'inversify';
import Koa from 'koa';
import Router from 'koa-router';
// eslint-disable-next-line import/no-duplicates
import { IMiddleware } from 'koa-router';
import { ControllerInterface } from './controller.interface';
import { ApplicationInterface } from './application.interface';
import {
	metaActionParameters,
	metaControllerMiddlewares,
	metaControllerPath,
	metaControllerRoutes,
} from './controller.decorator';
import { MiddlewareInterface } from './middleware.interface';

@injectable()
export class KoaApplication implements ApplicationInterface {
	private readonly koa: Koa;

	constructor(
		@multiInject('Controller') private readonly controllers: ControllerInterface[],
		@multiInject('Middleware')
		@optional()
		private readonly middlewares: MiddlewareInterface[] = [],
	) {
		this.koa = new Koa();
		this.koa.silent = false;
		this.applyControllers(controllers, middlewares);
	}

	use(middleware: IMiddleware) {
		this.koa.use(middleware);
	}

	listen(port: number, address?: string, callback?: (err: Error, address: string) => void) {
		return this.koa.listen(port, address);
	}

	/**
	 * @todo инкапсултровал этот треш чтобы тут отрефакторить
	 */
	private applyControllers(
		instanceControllers: ControllerInterface[],
		instanceMiddlewares: MiddlewareInterface[],
	): void {
		const router: Router = new Router();

		for (const instanceController of instanceControllers) {
			const path =
				Reflect.getMetadata(metaControllerPath, instanceController.constructor) || '/';
			const routes =
				Reflect.getMetadata(metaControllerRoutes, instanceController.constructor) || [];
			routes.forEach((route: { method: string; path: string; action: string }) => {
				const url = `${path}${route.path}`.replace(/^[/]{2,}/, '/');

				const middlewareCtors: [
					{
						new (...args: any[]): any;
					},
				] = Reflect.getMetadata(
					metaControllerMiddlewares,
					instanceController.constructor,
					route.action,
				);

				const middlewaresToApply = instanceMiddlewares
					.filter(instanceMiddleware =>
						middlewareCtors.some(
							constructor => constructor.name === instanceMiddleware.constructor.name,
						),
					)
					.map(instance => instance.getRawMiddleware());

				router[route.method](url, ...middlewaresToApply, ctx => {
					const metaParameters: { type: string }[] =
						Reflect.getMetadata(
							metaActionParameters,
							instanceController.constructor,
							route.action,
						) || [];

					const map: { [key: string]: {} } = {
						ctx,
					};

					const actionArguments = metaParameters.map(parameter => map[parameter.type]);

					return instanceController[route.action](...actionArguments);
				});
			});
		}
	}

	on(eventName: string, callback: (...args: any[]) => void) {
		this.koa.on(eventName, callback);
	}

	getHttpServer(): Koa {
		return this.koa;
	}
}
