import moment       from 'moment/moment';
import { JSDOM }    from 'jsdom';
import mongoose     from 'mongoose';

import BaseTask           from './BaseTask';
import LikesCommonTask    from './LikesCommonTask';
import CommentsCommonTask from './CommentsCommonTask';
import RepostsCommonTask  from './RepostsCommonTask';

class AutoLikesTask extends BaseTask {
	async handle() {
		const Task                = mongoose.model('Task');
		const Group               = mongoose.model('Group');
		const LikesCommonModel    = mongoose.model('LikesCommon');
		const CommentsCommonModel = mongoose.model('CommentsCommon');
		const RepostsCommonModel  = mongoose.model('RepostsCommon');
		
		try {
			// Проверяем, что прошло 70 минут, чтобы не лайкать уже лайкнутый пост
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
			
			const link  = Group.getLinkByPublicId(this.taskDocument.group.publicId);
			const jsDom = await JSDOM.fromURL(link);
			
			const $lastPost = jsDom.window.document.querySelector('#page_wall_posts .post .wall_post_text');
			const $mentionLink = $lastPost.querySelector('a.mem_link');
			if (!$mentionLink) {
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
				return;
			}
			
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
			
			this.taskDocument.subTasks.push(commentsCommonDocument);
			this.taskDocument.subTasks.push(likesCommonDocument);
			this.taskDocument.subTasks.push(repostsCommonDocument);
			await Promise.all([
				this.taskDocument.save(),
				commentsCommonDocument.save(),
				likesCommonDocument.save(),
				repostsCommonDocument.save(),
			]);
			
			const errors = [];
			await Promise.all([
				likesCommonTask.handle().catch(error => errors.push(error)),
				commentsCommonTask.handle().catch(error => errors.push(error)),
				repostsCommonTask.handle().catch(error => errors.push(error)),
			]);
			
			if (errors.length) {
				throw errors;
			}
			this.taskDocument.lastHandleAt = new Date();
		} catch (error) {
			if (!Array.isArray(error)) {
				//eslint-disable-next-line no-throw-literal
				throw [error];
			}
			
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
