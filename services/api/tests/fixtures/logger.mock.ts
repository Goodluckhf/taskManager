import { LoggerInterface } from '../../../../lib/logger.interface';

export const loggerMock: LoggerInterface = {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	child(args: object): LoggerInterface {
		return this;
	},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	error(msg: string | object): void {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	info(msg: string | object): void {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	warn(msg: string | object): void {},
};
