import bluebird from 'bluebird';

import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import LikesCommonTask from './LikesCommonTask';
import CommentsCommonTask from './CommentsCommonTask';
import RepostsCommonTask from './RepostsCommonTask';
import LastPostWithLinkRequest from '../api/amqpRequests/LastPostWithLinkRequest';
import BillingAccount from '../billing/BillingAccount';
import {
	NotEnoughBalance,
	NotEnoughBalanceForComments,
	NotEnoughBalanceForLikes,
	NotEnoughBalanceForReposts,
} from '../api/errors/tasks';
import BaseTaskError from '../api/errors/tasks/BaseTaskError';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import { cleanLink } from '../../../lib/helper';

/**
 * @property {AutoLikesTaskDocument} taskDocument
 */
class AutoLikesTask extends BaseTask {
	/**
	 * @TODO: Зарефакторить сделать через фабрику
	 * @param {TaskDocument} task
	 */
	async freezeMoney(task) {
		if (!(this.account instanceof BillingAccount)) {
			return;
		}

		try {
			await this.account.freezeMoney(task);
		} catch (error) {
			if (task.__t === 'LikesCommon') {
				if (error instanceof NotEnoughBalance) {
					throw NotEnoughBalanceForLikes.fromNotEnoughBalance(
						error,
						task.postLink,
						task.likesCount,
					);
				}

				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'likes',
						error,
						task.postLink,
						task.likesCount,
					);
				}
			}

			if (task.__t === 'RepostsCommon') {
				if (error instanceof NotEnoughBalance) {
					throw NotEnoughBalanceForReposts.fromNotEnoughBalance(
						error,
						task.postLink,
						task.repostsCount,
					);
				}

				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'reposts',
						error,
						task.postLink,
						task.repostsCount,
					);
				}
			}

			if (task.__t === 'CommentsCommon') {
				if (error instanceof NotEnoughBalance) {
					throw NotEnoughBalanceForComments.fromNotEnoughBalance(
						error,
						task.postLink,
						task.commentsCount,
					);
				}

				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'comments',
						error,
						task.postLink,
						task.commentsCount,
					);
				}
			}

			throw error;
		}
	}

	/**
	 * @param {String} link
	 * @param {Array.<String>} targetLinks
	 * @return {Boolean}
	 */
	checkExternalLink(link, targetLinks) {
		try {
			if (!link || !targetLinks.length) {
				return false;
			}
			const cleanedLink = cleanLink(link);
			const hasExternalLink = targetLinks.some(
				targetLink => cleanedLink === cleanLink(targetLink),
			);
			if (!hasExternalLink) {
				this.logger.info({
					message: 'не совпало не с 1 из внешних ссылок',
					targetLinks: targetLinks.toObject(),
					cleanedLink,
					link,
				});
				return false;
			}

			return true;
		} catch (error) {
			this.logger.error({
				error,
				link,
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
			});
			return false;
		}
	}

	/**
	 * @param {String} postLink
	 * @param {String} mentionId
	 * @param {Array.<String>} targetPublics
	 * @return {boolean}
	 */
	checkTargetPublics(postLink, mentionId, targetPublics) {
		if (!targetPublics.length) {
			this.logger.info({
				message: 'Нет пабликов для накрутки',
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
			});
			return false;
		}

		if (!mentionId) {
			this.logger.info({
				message: 'Нет ссылки упоминания mentionId',
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
				postLink,
			});

			return false;
		}

		const hasTargetGroupInTask = targetPublics.some(
			targetGroup => `club${targetGroup.publicId}` === mentionId,
		);

		if (!hasTargetGroupInTask) {
			this.logger.info({
				message: 'упоминание не совпало ни с одной из ссылок',
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
				mentionId,
				targetPublics,
				postLink,
			});

			return false;
		}

		return true;
	}

	/**
	 * @param {String} mentionId
	 * @param {String} link
	 * @param {String} postLink
	 * @param {Array.<GroupDocument>} targetPublics
	 * @param {Array.<String>} targetLinks
	 * @return {Boolean}
	 */
	needToStartTask(mentionId, link, postLink, targetPublics, targetLinks) {
		if (this.taskDocument.contentPosts && !link && !mentionId) {
			this.logger.info({
				message: 'Вышел следущий контентный пост',
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
				postLink,
			});
			return true;
		}

		return (
			this.checkExternalLink(link, targetLinks) ||
			this.checkTargetPublics(postLink, mentionId, targetPublics)
		);
	}

	async handle() {
		const Task = mongoose.model('Task');
		const Group = mongoose.model('Group');
		const LikesCommonModel = mongoose.model('LikesCommon');
		const CommentsCommonModel = mongoose.model('CommentsCommon');
		const RepostsCommonModel = mongoose.model('RepostsCommon');

		let postLink;
		try {
			await this.taskDocument.populate('group').execPopulate();
			if (!this.taskDocument.group) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.warn({
					message: 'Like task has no group',
					taskId: this.taskDocument._id,
				});
				return;
			}

			const targetPublics = await Group.find({
				_id: {
					$in: this.taskDocument.user.targetGroups,
				},
			})
				.lean()
				.exec();

			const groupLink = Group.getLinkByPublicId(this.taskDocument.group.publicId);

			// @TODO: Сделать через класс задачи
			// Эту задачу не нужно сохранять в базе
			// Потому что она выполняется каждую минуту
			// И если не выполнится или будет какая-то ошибка
			// Ничего страшного, потому что через минуту еще раз запустится
			let lastPostResult;
			try {
				const request = new LastPostWithLinkRequest(this.config, {
					groupLink,
				});
				lastPostResult = await this.rpcClient.call(request);
			} catch (error) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.warn({
					message: 'LastPostWithLinkRequest error',
					userId: this.taskDocument.user.id,
					taskId: this.taskDocument.id,
					groupLink,
					error,
				});
				return;
			}

			//eslint-disable-next-line no-unused-vars
			const { postId, mentionId, link } = lastPostResult;
			postLink = Group.getPostLinkById(postId);

			if (postLink === this.taskDocument.lastPostLink) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.info({
					message: 'Пост уже учавствовал в накрутке',
					userId: this.taskDocument.user.id,
					taskId: this.taskDocument.id,
					postLink,
				});
				return;
			}

			const { targetLinks } = this.taskDocument.user;
			if (!this.needToStartTask(mentionId, link, postLink, targetPublics, targetLinks)) {
				this.taskDocument.status = Task.status.waiting;
				return;
			}

			const tasksToHandle = [];
			const errors = [];
			if (this.taskDocument.likesCount > 0) {
				const likesCommonDocument = LikesCommonModel.createInstance({
					postLink,
					user: this.taskDocument.user,
					likesCount: this.taskDocument.likesCount,
					status: Task.status.pending,
					parentTask: this.taskDocument,
				});

				const likesCommonTask = new LikesCommonTask({
					billing: this.billing,
					account: this.account,
					logger: this.logger,
					taskDocument: likesCommonDocument,
					rpcClient: this.rpcClient,
					config: this.config,
					uMetrics: this.uMetrics,
				});

				this.taskDocument.subTasks.push(likesCommonDocument);

				try {
					await this.freezeMoney(likesCommonDocument);
					tasksToHandle.push(likesCommonTask);
				} catch (error) {
					errors.push(error);
					likesCommonDocument.status = Task.status.finished;
					likesCommonDocument._error = error.toObject();
					likesCommonDocument.lastHandleAt = new Date();
				} finally {
					await likesCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}

			if (this.taskDocument.commentsCount > 0) {
				const commentsCommonDocument = CommentsCommonModel.createInstance({
					postLink,
					user: this.taskDocument.user,
					commentsCount: this.taskDocument.commentsCount,
					status: Task.status.pending,
					parentTask: this.taskDocument,
				});

				const commentsCommonTask = new CommentsCommonTask({
					billing: this.billing,
					account: this.account,
					logger: this.logger,
					taskDocument: commentsCommonDocument,
					rpcClient: this.rpcClient,
					config: this.config,
					uMetrics: this.uMetrics,
				});
				this.taskDocument.subTasks.push(commentsCommonDocument);

				try {
					await this.freezeMoney(commentsCommonDocument);
					tasksToHandle.push(commentsCommonTask);
				} catch (error) {
					errors.push(error);
					commentsCommonDocument.status = Task.status.finished;
					commentsCommonDocument._error = error.toObject();
					commentsCommonDocument.lastHandleAt = new Date();
				} finally {
					await commentsCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}

			if (this.taskDocument.repostsCount > 0) {
				const repostsCommonDocument = RepostsCommonModel.createInstance({
					postLink,
					user: this.taskDocument.user,
					repostsCount: this.taskDocument.repostsCount,
					status: Task.status.pending,
					parentTask: this.taskDocument,
				});

				const repostsCommonTask = new RepostsCommonTask({
					billing: this.billing,
					account: this.account,
					logger: this.logger,
					taskDocument: repostsCommonDocument,
					rpcClient: this.rpcClient,
					config: this.config,
					uMetrics: this.uMetrics,
				});

				this.taskDocument.subTasks.push(repostsCommonDocument);
				try {
					await this.freezeMoney(repostsCommonDocument);
					tasksToHandle.push(repostsCommonTask);
				} catch (error) {
					errors.push(error);
					repostsCommonDocument.status = Task.status.finished;
					repostsCommonDocument._error = error.toObject();
					repostsCommonDocument.lastHandleAt = new Date();
				} finally {
					await repostsCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}

			await this.taskDocument.save();

			await bluebird.map(tasksToHandle, async task => {
				const startTime = new Date();
				try {
					await task.handle();
					try {
						this.uMetrics.taskSuccessCount.inc(1, { task_type: task.taskDocument.__t });
					} catch (error) {
						this.logger.error({
							mark: 'uMetrics',
							message: 'unexpected error',
							error,
						});
					}
				} catch (error) {
					try {
						this.uMetrics.taskErrorCount.inc(1, { task_type: task.taskDocument.__t });
					} catch (_error) {
						this.logger.error({
							mark: 'uMetrics',
							message: 'unexpected error',
							error: _error,
						});
					}
					errors.push(error);
				} finally {
					try {
						const taskDuration = Date.now() - startTime;
						this.uMetrics.taskDuration.set(taskDuration, {
							task_type: task.taskDocument.__t,
						});
					} catch (error) {
						this.logger.error({
							mark: 'uMetrics',
							message: 'unexpected error',
							error,
						});
					}
				}
			});

			if (errors.length) {
				throw errors;
			}

			this.taskDocument.status = Task.status.waiting;
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.lastPostLink = postLink;
		} catch (error) {
			const errors = Array.isArray(error) ? error : [error];

			this.taskDocument.lastHandleAt = new Date();

			// По идее статус пропущенный нужно ставить
			// если задача выполнилась с ошибкой
			// Только в случае, что баланса не хватает
			// В остальных случая задача пусть будет
			const hasNotEnoughError = errors.some(
				_error =>
					_error instanceof NotEnoughBalanceForReposts ||
					_error instanceof NotEnoughBalanceForComments ||
					_error instanceof NotEnoughBalanceForLikes,
			);

			if (hasNotEnoughError) {
				this.taskDocument.status = Task.status.skipped;
			} else {
				this.taskDocument.status = Task.status.waiting;
			}
			this.taskDocument.lastPostLink = postLink;
			throw errors;
		} finally {
			await this.taskDocument.save();
		}
	}
}

export default AutoLikesTask;
