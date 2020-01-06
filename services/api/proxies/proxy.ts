import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import moment from 'moment';
import { model } from '../../../lib/inversify-typegoose/model.decorator';

@model()
export class Proxy {
	@prop({ required: true })
	url: string;

	@prop({ required: true })
	login: string;

	@prop({ required: true })
	password: string;

	@prop({ default: true })
	isActive: boolean;

	@prop()
	errorComment: Schema.Types.Mixed;

	@prop({ type: Date })
	inactiveAt: Date | moment.Moment;
}
