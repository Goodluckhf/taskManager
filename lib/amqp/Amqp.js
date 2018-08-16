import amqp     from 'amqplib';
import bluebird from 'bluebird';

/**
 * @property {Logger} logger
 * @property {String} host
 * @property {Number} port
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
	 */
	// eslint-disable-next-line object-curly-newline
	constructor(logger, { host, port, reconnectInterval, retry = true } = {}) {
		this.logger = logger;
		this.host   = host;
		this.port   = port;
		this.retry  = retry;
		
		this.reconnectInterval = reconnectInterval;
		this.connection        = null;
	}
	
	/**
	 * @return {Promise<Connection>}
	 */
	async connect() {
		const connectionURI = `amqp://${this.host}:${this.port}`;
		try {
			this.connection = await amqp.connect(connectionURI);
			this.connection.on('error', async (error) => {
				this.logger.error({ error });
				await this.connect();
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
