import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { model } from '../../../lib/inversify-typegoose/model.decorator';

@model()
export class VkUser {
	@prop({ required: true })
	login: string;

	@prop({ required: true })
	password: string;

	@prop({ default: true })
	isActive: boolean;

	@prop()
	errorComment: Schema.Types.Mixed;
}
