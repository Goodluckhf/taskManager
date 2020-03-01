import { arrayProp, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import moment from 'moment';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';
import { ProxyInterface } from '../proxies/proxy.interface';
import { tagsEnum } from './tags-enum.constant';

@model()
export class VkUser implements VkUserCredentialsInterface {
	@prop({ required: true })
	login: string;

	@prop({ required: true })
	password: string;

	@prop({ default: null })
	remixsid: string;

	@prop({ default: true })
	isActive: boolean;

	@arrayProp({ enum: tagsEnum, type: String })
	tags: tagsEnum;

	@prop()
	errorComment: Schema.Types.Mixed;

	@prop({ type: Date })
	inactiveAt: Date | moment.Moment;

	@arrayProp({ items: String, default: [] })
	groupIds: string[];

	@prop({ required: true })
	proxy: ProxyInterface;

	@prop({ default: null })
	userAgent: string;
}
