import bluebird from 'bluebird';

import mongoose                from '../../../lib/mongoose';
import BaseTask                from './BaseTask';
import LikesCommonTask         from './LikesCommonTask';
import CommentsCommonTask      from './CommentsCommonTask';
import RepostsCommonTask       from './RepostsCommonTask';
import LastPostWithLinkRequest from '../api/amqpRequests/LastPostWithLinkRequest';
import BillingAccount          from '../billing/BillingAccount';
import Billing                 from '../billing/Billing';
import {
	NotEnoughBalance,
	NotEnoughBalanceForComments,
	NotEnoughBalanceForLikes,
	NotEnoughBalanceForReposts,
}                              from '../api/errors/tasks';
import BaseTaskError           from '../api/errors/tasks/BaseTaskError';
import TaskErrorFactory        from '../api/errors/tasks/TaskErrorFactory';

/**
 * @property {AutoLikesTaskDocument} taskDocument
 */
class AutoLikesTask extends BaseTask {
	freezeMoney(type, postLink) {
		if (!(this.account instanceof BillingAccount)) {
			return;
		}
		
		if (type === 'like') {
			const invoice = this.billing.createInvoice(
				Billing.types.like,
				this.taskDocument.likesCount,
			);
			
			try {
				this.account.freezeMoney(invoice);
			} catch (error) {
				if (error instanceof NotEnoughBalance) {
					throw new NotEnoughBalanceForLikes(
						this.account.availableBalance,
						invoice.price,
						postLink,
						this.taskDocument.likesCount,
						error,
					);
				}
				
				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'likes',
						error,
						this.taskDocument.postLink,
						this.taskDocument.likesCount,
					);
				}
				
				throw error;
			}
		}
		
		if (type === 'repost') {
			const invoice = this.billing.createInvoice(
				Billing.types.repost,
				this.taskDocument.repostsCount,
			);
			
			try {
				this.account.freezeMoney(invoice);
			} catch (error) {
				if (error instanceof NotEnoughBalance) {
					throw new NotEnoughBalanceForReposts(
						this.account.availableBalance,
						invoice.price,
						postLink,
						this.taskDocument.repostsCount,
						error,
					);
				}
				
				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'reposts',
						error,
						this.taskDocument.postLink,
						this.taskDocument.repostsCount,
					);
				}
				
				throw error;
			}
		}
		
		if (type === 'comment') {
			const invoice = this.billing.createInvoice(
				Billing.types.comment,
				this.taskDocument.commentsCount,
			);
			
			try {
				this.account.freezeMoney(invoice);
			} catch (error) {
				if (error instanceof NotEnoughBalance) {
					throw new NotEnoughBalanceForComments(
						this.account.availableBalance,
						invoice.price,
						postLink,
						this.taskDocument.commentsCount,
						error,
					);
				}
				
				if (!(error instanceof BaseTaskError)) {
					throw TaskErrorFactory.createError(
						'comments',
						error,
						this.taskDocument.postLink,
						this.taskDocument.commentsCount,
					);
				}
				
				throw error;
			}
		}
	}
	
	async handle() {
		const Task                = mongoose.model('Task');
		const Group               = mongoose.model('Group');
		const LikesCommonModel    = mongoose.model('LikesCommon');
		const CommentsCommonModel = mongoose.model('CommentsCommon');
		const RepostsCommonModel  = mongoose.model('RepostsCommon');
		
		let postLink;
		try {
			await this.taskDocument.populate('group').execPopulate();
			if (!this.taskDocument.group) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.warn({
					message: 'Like task has no group',
					taskId : this.taskDocument._id,
				});
				return;
			}
			
			const targetPublics = await Group
				.find({
					_id: {
						$in: this.taskDocument.user.targetGroups,
					},
				})
				.lean()
				.exec();
			
			if (!targetPublics.length) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.info({
					message: 'Нет пабликов для накрутки',
					userId : this.taskDocument.user.id,
					taskId : this.taskDocument.id,
				});
				return;
			}
			
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
					userId : this.taskDocument.user.id,
					taskId : this.taskDocument.id,
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
					userId : this.taskDocument.user.id,
					taskId : this.taskDocument.id,
					postLink,
				});
				return;
			}
			
			if (!mentionId) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.info({
					message: 'Нет ссылки упоминания mentionId',
					userId : this.taskDocument.user.id,
					taskId : this.taskDocument.id,
					postLink,
				});
				return;
			}
			
			const hasTargetGroupInTask = targetPublics.some(targetGroup => (
				`club${targetGroup.publicId}` === mentionId
			));
			
			if (!hasTargetGroupInTask) {
				this.taskDocument.status = Task.status.waiting;
				this.logger.info({
					message: 'упоминание не совпало ни с одной из ссылок',
					userId : this.taskDocument.user.id,
					taskId : this.taskDocument.id,
					mentionId,
					targetPublics,
					postLink,
				});
				return;
			}
			
			const tasksToHandle = [];
			const errors        = [];
			if (this.taskDocument.likesCount > 0) {
				const likesCommonDocument = LikesCommonModel.createInstance({
					postLink,
					user      : this.taskDocument.user,
					likesCount: this.taskDocument.likesCount,
					status    : Task.status.pending,
					parentTask: this.taskDocument,
				});
				
				const likesCommonTask = new LikesCommonTask({
					billing     : this.billing,
					account     : this.account,
					logger      : this.logger,
					taskDocument: likesCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				
				this.taskDocument.subTasks.push(likesCommonDocument);
				
				try {
					this.freezeMoney('like', postLink);
					tasksToHandle.push(likesCommonTask);
				} catch (error) {
					errors.push(error);
					likesCommonDocument.status       = Task.status.finished;
					likesCommonDocument._error       = error.toObject();
					likesCommonDocument.lastHandleAt = new Date();
				} finally {
					await likesCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}
			
			if (this.taskDocument.commentsCount > 0) {
				const commentsCommonDocument = CommentsCommonModel.createInstance({
					postLink,
					user         : this.taskDocument.user,
					commentsCount: this.taskDocument.commentsCount,
					status       : Task.status.pending,
					parentTask   : this.taskDocument,
				});
				
				const commentsCommonTask = new CommentsCommonTask({
					billing     : this.billing,
					account     : this.account,
					logger      : this.logger,
					taskDocument: commentsCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				this.taskDocument.subTasks.push(commentsCommonDocument);
				
				try {
					this.freezeMoney('comment', postLink);
					tasksToHandle.push(commentsCommonTask);
				} catch (error) {
					errors.push(error);
					commentsCommonDocument.status       = Task.status.finished;
					commentsCommonDocument._error       = error.toObject();
					commentsCommonDocument.lastHandleAt = new Date();
				} finally {
					await commentsCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}
			
			if (this.taskDocument.repostsCount > 0) {
				const repostsCommonDocument = RepostsCommonModel.createInstance({
					postLink,
					user        : this.taskDocument.user,
					repostsCount: this.taskDocument.repostsCount,
					status      : Task.status.pending,
					parentTask  : this.taskDocument,
				});
				
				const repostsCommonTask = new RepostsCommonTask({
					billing     : this.billing,
					account     : this.account,
					logger      : this.logger,
					taskDocument: repostsCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				
				this.taskDocument.subTasks.push(repostsCommonDocument);
				try {
					this.freezeMoney('repost', postLink);
					tasksToHandle.push(repostsCommonTask);
				} catch (error) {
					errors.push(error);
					repostsCommonDocument.status       = Task.status.finished;
					repostsCommonDocument._error       = error.toObject();
					repostsCommonDocument.lastHandleAt = new Date();
				} finally {
					await repostsCommonDocument.save();
					await this.taskDocument.user.save();
				}
			}
			
			await this.taskDocument.save();
			
			await bluebird.map(
				tasksToHandle,
				task => task.handle().catch(error => errors.push(error)),
			);
			
			if (errors.length) {
				throw errors;
			}
			
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.lastPostLink = postLink;
		} catch (error) {
			const errors = Array.isArray(error) ? error : [error];
			
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.lastPostLink = postLink;
			throw errors;
		} finally {
			await this.taskDocument.save();
		}
	}
}

export default AutoLikesTask;
