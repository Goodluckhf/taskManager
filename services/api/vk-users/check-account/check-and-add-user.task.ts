import moment from 'moment';
import { arrayProp, prop } from '@typegoose/typegoose';
import { model } from '../../../../lib/inversify-typegoose/model.decorator';
import { CommonTask } from '../../task/common-task';
import { DelayableTaskInterface } from '../../task/delayable-task.interface';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { VkUserCredentialDto } from '../dto/vk-user.credential.dto';
import { tagsEnum } from '../tags-enum.constant';

@model({ discriminatorClass: CommonTask })
export class CheckAndAddUserTask extends CommonTask implements DelayableTaskInterface {
	@arrayProp({ items: VkUserCredentialDto })
	usersCredentials: VkUserCredentialsInterface[];

	@arrayProp({ enum: tagsEnum, type: String })
	tags: tagsEnum[];

	@prop({ required: true, type: Date })
	startAt: Date | moment.Moment;
}
