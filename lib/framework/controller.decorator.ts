import 'reflect-metadata';
import { MiddlewareInterface } from './middleware.interface';

export const metaControllerPath = Symbol('metaControllerPath');
export const metaControllerRoutes = Symbol('metaControllerRoutes');
export const metaControllerMiddlewares = Symbol('metaControllerMiddlewares');
export const metaActionParameters = Symbol('metaActionParameters');

export function Controller(path: string): ClassDecorator {
	return (target): void => Reflect.defineMetadata(metaControllerPath, path, target);
}

function makeActionDecorator(path: string, target, action, method: string): void {
	if (!Reflect.hasMetadata(metaControllerRoutes, target.constructor)) {
		Reflect.defineMetadata(metaControllerRoutes, [], target.constructor);
	}
	const routes = Reflect.getMetadata(metaControllerRoutes, target.constructor);
	routes.push({
		method,
		path,
		action,
	});
	Reflect.defineMetadata(metaControllerRoutes, routes, target.constructor);
}

export function Get(path = ''): MethodDecorator {
	return (target, action): void => {
		makeActionDecorator(path, target, action, 'get');
	};
}

export function Post(path = ''): MethodDecorator {
	return (target, action): void => {
		makeActionDecorator(path, target, action, 'post');
	};
}

export function Use<T extends MiddlewareInterface>(middleware: {
	new (...args: any[]): T;
}): MethodDecorator {
	return (target, action): void => {
		if (!Reflect.hasMetadata(metaControllerMiddlewares, target.constructor)) {
			Reflect.defineMetadata(metaControllerMiddlewares, [], target.constructor, action);
		}

		const middlewares = Reflect.getMetadata(
			metaControllerMiddlewares,
			target.constructor,
			action,
		);

		middlewares.push(middleware);
	};
}

function makeActionParameterDecorator(
	type: string,
	target: {},
	index: number,
	key: string | symbol,
): void {
	if (!Reflect.hasMetadata(metaActionParameters, target.constructor)) {
		Reflect.defineMetadata(metaActionParameters, [], target.constructor);
	}
	const parameters = Reflect.getMetadata(metaActionParameters, target.constructor);
	parameters[index] = { type, argumentIndex: index, action: key };
	Reflect.defineMetadata(metaActionParameters, parameters, target.constructor, key);
}

export function Ctx(): ParameterDecorator {
	return (target, key, index): void => {
		makeActionParameterDecorator('ctx', target, index, key);
	};
}
