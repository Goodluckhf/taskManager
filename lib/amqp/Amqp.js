import amqp     from 'amqplib';
import bluebird from 'bluebird';

/**
 * @property {Logger} logger
 * @property {String} host
 * @property {Number} port
 * @property {String} login
 * @property {String} password
 * @property {Number} reconnectInterval
 * @property {Connection} connection
 */
class Amqp {
	/**
	 * @param {Logger} logger
	 * @param {Object} config
	 * @param {String} config.host
	 * @param {Number} config.port
	 * @param {Number} config.reconnectInterval
	 * @param {Boolean} config.retry
	 */
	// eslint-disable-next-line object-curly-newline
	constructor(logger, { host, port, login, password, reconnectInterval, retry = true } = {}) {
		this.logger   = logger;
		this.host     = host;
		this.port     = port;
		this.login    = login;
		this.password = password;
		this.retry    = retry;
		
		this.reconnectInterval = reconnectInterval;
		this.connection        = null;
	}
	
	/**
	 * @return {Promise<Connection>}
	 */
	async connect() {
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

export default Amqp;
