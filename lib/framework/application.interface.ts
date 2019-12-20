import { Middleware } from 'koa';

export interface ApplicationInterface {
	listen(port: number, address?: string, callback?: (err: Error, address: string) => void): void;
	use(middleware: Middleware): void;
	on(eventName: string, callback: (...args: any[]) => void);
}
