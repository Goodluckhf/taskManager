import BaseTask from './BaseTask';

class LikesCheckTask extends BaseTask {
	async handle() {
		this.logger.info('Задача по расписанию');
	}
}

export default LikesCheckTask;
