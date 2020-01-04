import { InversifyExpressServer } from 'inversify-express-utils';
import { interfaces } from 'inversify';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { AuthProvider } from './auth/auth.provider';
import { errorHandlerMiddleware } from './error-handler-middleware';

export function createApplication(diContainer: interfaces.Container): Application {
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	let application = new InversifyExpressServer(diContainer, null, null, null, AuthProvider);
	application = application
		.setConfig(app => {
			app.use(bodyParser());
		})
		.setErrorConfig(app => {
			app.use(errorHandlerMiddleware);
		});

	return application.build();
}
