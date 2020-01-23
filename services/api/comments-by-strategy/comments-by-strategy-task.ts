import { arrayProp, prop } from '@typegoose/typegoose';
import moment from 'moment';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { CommonTask } from '../task/common-task';
import { CommentStrategy } from './comment-strategy';
import { CommentByStrategyTaskInterface } from './comment-by-strategy-task.interface';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { CompositeTaskInterface } from '../task/composite-task.interface';

@model({ discriminatorClass: CommonTask })
export class CommentsByStrategyTask extends CommonTask
	implements CommentByStrategyTaskInterface, DelayableTaskInterface, CompositeTaskInterface {
	@prop({ required: true })
	postLink: string;

	@arrayProp({ items: CommentStrategy })
	commentsStrategy: CommentStrategy[];

	@arrayProp({ items: String })
	vkUserLogins: string[];

	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;

	@prop({ required: true, default: 0 })
	finishedCount: number;

	@prop({ default: [] })
	subTasksErrors: object[];

	@prop({ required: true, default: 0 })
	tasksCount: number;
}
