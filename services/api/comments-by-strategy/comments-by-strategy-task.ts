import { arrayProp, prop } from '@typegoose/typegoose';
import moment from 'moment';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { CommonTask } from '../task/common-task';
import { CommentStrategy } from './comment-strategy';
import { CommentByStrategyTaskInterface } from './comment-by-strategy-task.interface';
import { DelayableTaskInterface } from '../task/delayable-task.interface';

@model({ discriminatorClass: CommonTask })
export class CommentsByStrategyTask extends CommonTask
	implements CommentByStrategyTaskInterface, DelayableTaskInterface {
	@prop({ required: true })
	postLink: string;

	@arrayProp({ items: CommentStrategy })
	commentsStrategy: CommentStrategy[];

	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;
}
