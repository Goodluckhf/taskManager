import { prop } from '@typegoose/typegoose';
import moment from 'moment';
import { CommonTask } from '../../task/common-task';
import { model } from '../../../../lib/inversify-typegoose/model.decorator';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { DelayableTaskInterface } from '../../task/delayable-task.interface';

@model({ discriminatorClass: CommonTask })
export class CheckAccountTask extends CommonTask implements DelayableTaskInterface {
	@prop({})
	usersCredentials: VkUserCredentialsInterface;

	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;
}
