import moment   from 'moment/moment';
import mongoose from 'mongoose';
import bluebird from 'bluebird';

import BaseTask           from './BaseTask';
import LikesCommonTask    from './LikesCommonTask';
import CommentsCommonTask from './CommentsCommonTask';
import RepostsCommonTask  from './RepostsCommonTask';
import PostCheckAdRequest from '../api/amqpRequests/PostCheckAdRequest';

class AutoLikesTask extends BaseTask {
	async handle() {
		const Task                = mongoose.model('Task');
		const Group               = mongoose.model('Group');
		const LikesCommonModel    = mongoose.model('LikesCommon');
		const CommentsCommonModel = mongoose.model('CommentsCommon');
		const RepostsCommonModel  = mongoose.model('RepostsCommon');
		
		let postLink;
		try {
			// Проверяем, что прошло 70 минут, Потому что, пост обычно стоит не менее 60 минут
			const likesInterval = parseInt(this.config.get('autoLikesTask.likesInterval'), 10);
			if (this.taskDocument.lastHandleAt && moment().diff(moment(this.taskDocument.lastHandleAt), 'minutes') < likesInterval) {
				return;
			}
			
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
			let postId;
			try {
				const request = new PostCheckAdRequest(this.config, {
					groupLink,
					targetPublics: targetPublics.map(p => p.publicId),
				});
				postId = await this.rpcClient.call(request);
			} catch (error) {
				this.logger.info({ error });
				return;
			}
			
			postLink = Group.getPostLinkById(postId);
			
			if (postLink === this.taskDocument.lastPostLink) {
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
			
			this.taskDocument.lastPostLink = postLink;
			this.taskDocument.lastHandleAt = new Date();
		} catch (error) {
			if (!Array.isArray(error)) {
				//eslint-disable-next-line no-throw-literal
				throw [error];
			}
			
			this.taskDocument.lastPostLink = postLink;
			this.taskDocument.lastHandleAt = new Date();
			throw error;
		} finally {
			//@TODO: Сделать все таки finished статус
			this.taskDocument.status = Task.status.waiting;
			await this.taskDocument.save();
		}
	}
}

export default AutoLikesTask;
