import { prop } from '@typegoose/typegoose';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { UserAgentInterface } from './user-agent.interface';

@model()
export class UserAgent implements UserAgentInterface {
	@prop({ required: true })
	userAgent: string;

	@prop({ default: true })
	isActive: boolean;
}
