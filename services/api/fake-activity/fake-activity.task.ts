import { prop } from '@typegoose/typegoose';
import moment from 'moment';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { CommonTask } from '../task/common-task';

@model({ discriminatorClass: CommonTask })
export class FakeActivityTask extends CommonTask implements DelayableTaskInterface {
	@prop({ required: true })
	login: string;

	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;
}
