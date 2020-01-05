import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

@model()
export class VkUser implements VkUserCredentialsInterface {
	@prop({ required: true })
	login: string;

	@prop({ required: true })
	password: string;

	@prop({ default: true })
	isActive: boolean;

	@prop()
	errorComment: Schema.Types.Mixed;
}
