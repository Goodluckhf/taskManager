import amqp from 'amqplib';
import bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { LoggerInterface } from '../logger.interface';
import { ConfigInterface } from '../../config/config.interface';
import { AmqpAdapterInterface } from './amqp-adapter.interface';

@injectable()
export class AmqpAdapter implements AmqpAdapterInterface {
	private readonly host: string;

	private readonly port: number;

	private readonly login: string;

	private readonly password: string;

	private readonly retry: boolean;

	private readonly reconnectInterval: number;

	private connection: amqp.Connection;

	constructor(
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject('Config') private readonly config: ConfigInterface,
	) {
		this.logger = logger;
		const { host, port, login, password, reconnectInterval, retry = true } = this.config.get(
			'rabbit',
		);

		this.host = host;
		this.port = port;
		this.login = login;
		this.password = password;
		this.retry = retry;

		this.reconnectInterval = reconnectInterval;
		this.connection = null;
	}

	async connect(): Promise<amqp.Connection> {
		const connectionURI = `amqp://${this.login}:${this.password}@${this.host}:${this.port}`;
		try {
			this.connection = await amqp.connect(connectionURI);
			this.connection.on('close', (...args) => {
				this.logger.error({
					args,
					message: 'Shutting down because connection closed',
				});
				setTimeout(() => {
					process.exit(1);
				}, 500);
			});

			this.connection.on('error', (...args) => {
				this.logger.error({
					args,
					message: 'Shutting down because connection error',
				});
				setTimeout(() => {
					process.exit(1);
				}, 500);
			});

			this.logger.info(`successfully connected to rabbit via: ${connectionURI}`);
			return this.connection;
		} catch (error) {
			if (!this.retry) {
				throw error;
			}

			this.logger.error({
				message: `reconnecting to rabbit in: ${this.reconnectInterval}ms`,
				error,
			});

			await bluebird.delay(this.reconnectInterval);
			return this.connect();
		}
	}
}
