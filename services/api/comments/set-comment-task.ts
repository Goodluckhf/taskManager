import moment from 'moment';
import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { CommonTask } from '../task/common-task';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { CommentStrategyInterface } from '../comments-by-strategy/comment-strategy.interface';

@model({ discriminatorClass: CommonTask })
export class SetCommentTask extends CommonTask
	implements DelayableTaskInterface, CommentStrategyInterface {
	@prop({ type: Date, required: true })
	startAt: Date | moment.Moment;

	@prop({ type: Types.ObjectId })
	parentTaskId: Types.ObjectId;

	@prop()
	userFakeId: number;

	@prop()
	replyToCommentId?: string;

	@prop({ required: true })
	postLink: string;

	@prop({ required: true })
	text: string;

	@prop()
	imageURL: string;

	@prop({ default: 0 })
	likesCount: number;

	@prop()
	replyToCommentNumber: number;

	@prop()
	commentIndex: number;
}
