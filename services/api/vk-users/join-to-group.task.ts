import moment from 'moment';
import { prop } from '@typegoose/typegoose';
import { CommonTask } from '../task/common-task';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { GroupJoinTaskInterface } from './group-join-task.interface';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';
import { model } from '../../../lib/inversify-typegoose/model.decorator';

@model({ discriminatorClass: CommonTask })
export class JoinToGroupTask extends CommonTask
	implements DelayableTaskInterface, GroupJoinTaskInterface {
	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;

	@prop({ required: true })
	groupId: string;

	@prop({ required: true })
	vkUserCredentials: VkUserCredentialsInterface;
}
