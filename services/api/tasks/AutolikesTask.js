import moment       from 'moment/moment';
import { JSDOM }    from 'jsdom';
import mongoose     from 'mongoose';

import BaseTask     from './BaseTask';
import BaseApiError from '../api/errors/BaseApiError';
import LikeRequest  from '../api/amqpRequests/LikeRequest';

class AutoLikesTask extends BaseTask {
	async handle() {
		const Task      = mongoose.model('Task');
		const Group     = mongoose.model('Group');
		const LikesTask = mongoose.model('LikesTask');
		
		// Проверяем, что прошло 70 минут, чтобы не лайкать уже лайкнутый пост
		this.task.status = Task.status.pending;
		await this.task.save();
		const likesInterval = parseInt(this.config.get('autoLikesTask.likesInterval'), 10);
		if (this.task.lastLikedAt && moment().diff(moment(this.task.lastLikedAt), 'minutes') < likesInterval) {
			this.task.status = Task.status.waiting;
			await this.task.save();
			return;
		}
		
		if (!this.task.group) {
			this.logger.warn({
				message: 'Like task has no group',
				taskId : this.task._id,
			});
			this.task.status = Task.status.waiting;
			await this.task.save();
			return;
		}
		
		const targetPublics = await Group.find({ isTarget: true }).lean().exec();
		
		if (!targetPublics.length) {
			this.task.status = Task.status.waiting;
			await this.task.save();
			return;
		}
		
		const link  = Group.getLinkByPublicId(this.task.group.publicId);
		const jsDom = await JSDOM.fromURL(link);
		
		const $mentionLink = jsDom.window.document.querySelectorAll('#page_wall_posts .post .wall_post_text a.mem_link')[0];
		if (!$mentionLink) {
			this.task.status = Task.status.waiting;
			await this.task.save();
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
			this.task.status = Task.status.waiting;
			await this.task.save();
			return;
		}
		
		const likesTask = LikesTask.createInstance({
			postLink,
			likesCount: this.task.likesCount,
			status    : Task.status.pending,
		});
		await likesTask.save();
		
		const request = new LikeRequest(this.config, {
			postLink,
			likesCount: this.task.likesCount,
		});
		this.logger.info({ request });
		
		(async () => {
			try {
				const result = await this.rpcClient.call(request);
				if (result.error) {
					throw result.error;
				}
			} catch (error) {
				const wrapedError = new BaseApiError(error.message, 500).combine(error);
				this.logger.error({ error });
				likesTask._error  = wrapedError.toObject();
			}
			
			likesTask.status =  Task.status.finished;
			await likesTask.save();
			//eslint-disable-next-line no-param-reassign
			this.task.lastLikedAt = new Date();
			this.task.status = Task.status.waiting;
			await this.task.save();
		})();
	}
}

export default AutoLikesTask;
