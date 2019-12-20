// eslint-disable-next-line max-classes-per-file
import { injectable } from 'inversify';
import { ControllerInterface } from '../controller.interface';
import { Ctx, Get, Use } from '../controller.decorator';
import { MiddlewareInterface } from '../middleware.interface';

@injectable()
class MiddlewareA implements MiddlewareInterface {
	getRawMiddleware() {
		return async (ctx, next) => {
			ctx.state = 10;
			await next();
		};
	}
}

@injectable()
class MiddlewareB implements MiddlewareInterface {
	getRawMiddleware() {
		return async (ctx, next) => {
			ctx.state += 20;
			await next();
		};
	}
}

@injectable()
export class ControllerC implements ControllerInterface {
	@Get('/index')
	@Use(MiddlewareA)
	@Use(MiddlewareB)
	index(@Ctx() ctx) {
		ctx.body = ctx.state;
	}
}
