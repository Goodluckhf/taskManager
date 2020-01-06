import { prop } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Exclude } from 'class-transformer';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { Roles } from './roles.constant';

@model()
export class User extends Base {
	@prop({ required: true })
	email: string;

	@Exclude()
	@prop({ required: true })
	passwordHash: string;

	@Exclude()
	@prop()
	salt: string;

	@prop({ required: true, default: Roles.common, enum: Roles, type: String })
	role: Roles;
}
