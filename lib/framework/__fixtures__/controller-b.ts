// eslint-disable-next-line max-classes-per-file
import { injectable } from 'inversify';
import { ControllerInterface } from '../controller.interface';
import { Ctx, Get, Use } from '../controller.decorator';
import { MiddlewareInterface } from '../middleware.interface';

@injectable()
class MiddlewareA implements MiddlewareInterface {
	getRawMiddleware() {
		return ctx => {
			ctx.body = 20;
		};
	}
}

@injectable()
export class ControllerB implements ControllerInterface {
	@Get('/index')
	@Use(MiddlewareA)
	index(@Ctx() ctx) {
		ctx.body = 10;
	}
}
