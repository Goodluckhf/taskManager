import moment       from 'moment/moment';
import { JSDOM }    from 'jsdom';
import mongoose     from 'mongoose';

import BaseTask  from './BaseTask';
import LikesTask from './LikesTask';

/**
 * @property {VkApi} vkApi
 */
class AutoLikesTask extends BaseTask {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}
	
	async handle() {
		const Task           = mongoose.model('Task');
		const Group          = mongoose.model('Group');
		const LikesTaskModel = mongoose.model('LikesTask');
		
		// Проверяем, что прошло 70 минут, чтобы не лайкать уже лайкнутый пост
		this.taskDocument.status = Task.status.pending;
		await this.taskDocument.save();
		const likesInterval = parseInt(this.config.get('autoLikesTask.likesInterval'), 10);
		if (this.taskDocument.lastLikedAt && moment().diff(moment(this.taskDocument.lastLikedAt), 'minutes') < likesInterval) {
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
			parentTask  : this.taskDocument,
			taskDocument: likesTaskDocument,
			rpcClient   : this.rpcClient,
			config      : this.config,
			vkApi       : this.vkApi,
		});
		
		await likesTask.handle();
	}
}

export default AutoLikesTask;
