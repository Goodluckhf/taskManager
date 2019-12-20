import { IMiddleware } from 'koa-router';

export interface MiddlewareInterface {
	getRawMiddleware(): IMiddleware;
}
