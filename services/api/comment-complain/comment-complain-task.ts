import moment from 'moment';
import { prop } from '@typegoose/typegoose';
import { CommonTask } from '../task/common-task';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { DelayableTaskInterface } from '../task/delayable-task.interface';

@model({ discriminatorClass: CommonTask })
export class CommentComplainTask extends CommonTask implements DelayableTaskInterface {
	@prop({ type: Date, required: true })
	startAt: Date | moment.Moment;

	@prop({ required: true })
	commentLink: string;

	@prop({ required: true })
	login: string;
}
