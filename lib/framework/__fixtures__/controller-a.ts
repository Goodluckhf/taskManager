import { injectable } from 'inversify';
import { ControllerInterface } from '../controller.interface';
import { Ctx, Get } from '../controller.decorator';

@injectable()
export class ControllerA implements ControllerInterface {
	@Get('/index')
	index(@Ctx() ctx) {
		ctx.body = 10;
	}
}
