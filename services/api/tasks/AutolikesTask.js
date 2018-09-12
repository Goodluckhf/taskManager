import moment       from 'moment/moment';
import { JSDOM }    from 'jsdom';
import mongoose     from 'mongoose';

import BaseTask     from './BaseTask';
import LikesTask    from './LikesTask';
import CommentsTask from './CommentsTask';

class AutoLikesTask extends BaseTask {
	async handle() {
		const Task              = mongoose.model('Task');
		const Group             = mongoose.model('Group');
		const LikesTaskModel    = mongoose.model('LikesTask');
		const CommentsTaskModel = mongoose.model('CommentsTask');
		
		const errors = [];
		
		try {
			// Проверяем, что прошло 70 минут, чтобы не лайкать уже лайкнутый пост
			const likesInterval = parseInt(this.config.get('autoLikesTask.likesInterval'), 10);
			if (this.taskDocument.lastHandleAt && moment().diff(moment(this.taskDocument.lastHandleAt), 'minutes') < likesInterval) {
				this.taskDocument.status = Task.status.waiting;
				await this.taskDocument.save();
				return;
			}
			
			if (!this.taskDocument.group) {
				this.logger.warn({
					message: 'Like task has no group',
					taskId : this.taskDocument._id,
				});
				this.taskDocument.status = Task.status.waiting;
				await this.taskDocument.save();
				return;
			}
			
			const targetPublics = await Group.find({ isTarget: true }).lean().exec();
			
			if (!targetPublics.length) {
				this.taskDocument.status = Task.status.waiting;
				await this.taskDocument.save();
				return;
			}
			
			const link  = Group.getLinkByPublicId(this.taskDocument.group.publicId);
			const jsDom = await JSDOM.fromURL(link);
			
			const $mentionLink = jsDom.window.document.querySelectorAll('#page_wall_posts .post .wall_post_text a.mem_link')[0];
			if (!$mentionLink) {
				this.taskDocument.status = Task.status.waiting;
				await this.taskDocument.save();
				return;
			}
			
			// Ссылка на пост
			const $post    = jsDom.window.document.querySelectorAll('#page_wall_posts .post')[0];
			const $postId  = $post.attributes.getNamedItem('data-post-id');
			const postLink = Group.getPostLinkById($postId.value);
			
			const mentionId  = $mentionLink.attributes.getNamedItem('mention_id');
			
			const hasTargetGroupInTask = targetPublics.some((targetGroup) => {
				return `club${targetGroup.publicId}` === mentionId.value;
			});
			
			if (!hasTargetGroupInTask) {
				this.taskDocument.status = Task.status.waiting;
				await this.taskDocument.save();
				return;
			}
			
			const likesTaskDocument = LikesTaskModel.createInstance({
				postLink,
				likesCount: this.taskDocument.likesCount,
				status    : Task.status.pending,
				parentTask: this.taskDocument,
			});
			
			const likesTask = new LikesTask({
				logger      : this.logger,
				taskDocument: likesTaskDocument,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			const commentsTaskDocument = CommentsTaskModel.createInstance({
				postLink,
				commentsCount: this.taskDocument.commentsCount,
				status       : Task.status.pending,
				parentTask   : this.taskDocument,
			});
			
			const commentsTask = new CommentsTask({
				logger      : this.logger,
				taskDocument: commentsTaskDocument,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			this.taskDocument.subTasks.push(commentsTaskDocument);
			this.taskDocument.subTasks.push(likesTaskDocument);
			await Promise.all([
				this.taskDocument.save(),
				commentsTaskDocument.save(),
				likesTaskDocument.save(),
			]);
			
			await Promise.all([
				likesTask.handle().catch(error => errors.push(error)),
				commentsTask.handle().catch(error => errors.push(error)),
			]);
			
			if (errors.length) {
				throw errors;
			}
		} catch (error) {
			if (!Array.isArray(error)) {
				//eslint-disable-next-line no-throw-literal
				throw [error];
			}
			
			throw error;
		} finally {
			this.taskDocument.lastHandleAt = new Date();
			
			//@TODO: Сделать все таки finished статус
			this.taskDocument.status = Task.status.waiting;
			await this.taskDocument.save();
		}
	}
}

export default AutoLikesTask;
