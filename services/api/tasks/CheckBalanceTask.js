import moment         from 'moment';
import mongoose       from '../../../lib/mongoose';
import BaseTask       from './BaseTask';
import BillingAccount from '../billing/BillingAccount';

/**
 * @property {Alert} alert
 */
class CheckBalanceTask extends BaseTask {
	constructor({ alert, ...args }) {
		super(args);
		this.alert = alert;
	}
	
	async check() {
		const Task  = mongoose.model('Task');
		try {
			const interval = this.config.get('checkBalanceTask.interval');
			const momentLastHandled = moment(this.taskDocument.lastHandleAt);
			if (this.taskDocument.lastHandleAt && moment().diff(momentLastHandled, 'minutes') < interval) {
				return;
			}
			
			if (!(this.account instanceof BillingAccount)) {
				this.logger.warn({
					mark   : 'checkBalance',
					message: 'account is not billing',
					userId : this.account.user.id,
					taskId : this.taskDocument.id,
				});
				return;
			}
			
			//Проверяем если у пользователя задачи, которые потенциально выполниться
			const tasks = await mongoose.model('AutoLikesTask').find({
				user     : this.account.user.id,
				deletedAt: null,
				
				$or: [
					{ status: Task.status.waiting },
					{ status: Task.status.pending },
				],
			}).lean().exec();
			
			if (!tasks.length) {
				return;
			}
			
			const checkRatio = this.config.get('checkBalanceTask.ratio');
			const total = this.billing.calculatePriceForTasks(tasks);
			if (total / this.account.user.balance > checkRatio) {
				this.logger.info({
					mark            : 'checkBalance',
					message         : 'Мало баланса',
					total,
					availableBalance: this.account.availableBalance,
					userId          : this.account.user.id,
					taskId          : this.taskDocument.id,
				});
				await this.alert.sendError(
					`----------\nБаланс почти на исходе.\nДоступно: ${this.account.availableBalance}\n-------------`,
					this.account.user.chatId,
				);
			}
			this.taskDocument.lastHandleAt = moment.now();
		} catch (error) {
			this.logger.error({
				error,
				mark  : 'checkBalance',
				userId: this.account.user.id,
				taskId: this.taskDocument.id,
			});
			this.taskDocument.lastHandleAt = moment.now();
		} finally {
			this.taskDocument.status       = Task.status.waiting;
			await this.taskDocument.save();
		}
	}
	
	async handle() {
		try {
			await this.check();
		} catch (error) {
			this.logger.error({
				error,
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
			});
		}
	}
}

export default CheckBalanceTask;
