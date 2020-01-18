import moment from 'moment';
import { prop } from '@typegoose/typegoose';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { CommonTask } from '../task/common-task';
import { DelayableTaskInterface } from '../task/delayable-task.interface';

@model({ discriminatorClass: CommonTask })
export class CheckAllUsersTask extends CommonTask implements DelayableTaskInterface {
	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;
}
