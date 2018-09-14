/**
 * @property {Logger} logger
 * @property {Map} waitings
 * @property {Boolean} stopping
 */
class GracefulStop {
	constructor(logger) {
		this.logger   = logger;
		this.waitings = new Map();
		this.stopping = false;
	}
	
	/**
	 * @return {boolean}
	 */
	get isStopping() {
		return this.stopping;
	}
	
	/**
	 * Регистрирует ожидателя
	 * @param {String} key
	 */
	setWaitor(key) {
		this.waitings.set(key, false);
	}
	
	
	/**
	 * Устанваливает ожидателя готовым к остановке
	 * @param {String} key
	 */
	setReady(key) {
		this.waitings.set(key, true);
	}
	
	
	/**
	 * Не готов к выходу
	 * @param {String} key
	 */
	setProcessing(key) {
		this.waitings.set(key, false);
	}
	
	
	/**
	 * @param {Number} status
	 */
	stop(status = 0) {
		this.logger.info('Start graceful stop');
		this.stopping = true;
		setInterval(() => {
			for (const ready of this.waitings.values()) {
				if (!ready) {
					return;
				}
			}
			
			this.logger.info('Successful graceful stop');
			setTimeout(() => {
				process.exit(status);
			}, 200);
		}, 1000);
	}
}

export default GracefulStop;
