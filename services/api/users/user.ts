import { prop } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { Roles } from './roles.constant';

@model()
export class User extends Base {
	@prop({ required: true })
	email: string;

	@prop({ required: true })
	passwordHash: string;

	@prop()
	salt: string;

	@prop({ required: true, default: Roles.common, enum: Roles, type: String })
	role: Roles;
}
