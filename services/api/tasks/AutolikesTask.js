import mongoose from 'mongoose';
import bluebird from 'bluebird';

import BaseTask                from './BaseTask';
import LikesCommonTask         from './LikesCommonTask';
import CommentsCommonTask      from './CommentsCommonTask';
import RepostsCommonTask       from './RepostsCommonTask';
import LastPostWithLinkRequest from '../api/amqpRequests/LastPostWithLinkRequest';

class AutoLikesTask extends BaseTask {
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
				this.logger.info({ groupLink, error });
				return;
			}
			
			//eslint-disable-next-line no-unused-vars
			const { postId, mentionId, link } = lastPostResult;
			this.logger.info({ groupLink, lastPostResult });
			postLink = Group.getPostLinkById(postId);
			
			if (postLink === this.taskDocument.lastPostLink) {
				return;
			}
			
			if (!mentionId) {
				return;
			}
			
			const hasTargetGroupInTask = targetPublics.some(targetGroup => (
				`club${targetGroup.publicId}` === mentionId
			));
			
			if (!hasTargetGroupInTask) {
				return;
			}
			
			const tasksToHandle = [];
			if (this.taskDocument.likesCount > 0) {
				const likesCommonDocument = LikesCommonModel.createInstance({
					postLink,
					user      : this.taskDocument.user,
					likesCount: this.taskDocument.likesCount,
					status    : Task.status.pending,
					parentTask: this.taskDocument,
				});
				
				const likesCommonTask = new LikesCommonTask({
					logger      : this.logger,
					taskDocument: likesCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				
				this.taskDocument.subTasks.push(likesCommonDocument);
				await likesCommonDocument.save();
				tasksToHandle.push(likesCommonTask);
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
					logger      : this.logger,
					taskDocument: commentsCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				this.taskDocument.subTasks.push(commentsCommonDocument);
				await commentsCommonDocument.save();
				tasksToHandle.push(commentsCommonTask);
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
					logger      : this.logger,
					taskDocument: repostsCommonDocument,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				
				this.taskDocument.subTasks.push(repostsCommonDocument);
				await repostsCommonDocument.save();
				tasksToHandle.push(repostsCommonTask);
			}
			
			await this.taskDocument.save();
			
			const errors = [];
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
			if (!Array.isArray(error)) {
				//eslint-disable-next-line no-throw-literal
				throw [error];
			}
			
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.lastPostLink = postLink;
			throw error;
		} finally {
			//@TODO: Сделать все таки finished статус
			this.taskDocument.status = Task.status.waiting;
			await this.taskDocument.save();
		}
	}
}

export default AutoLikesTask;
