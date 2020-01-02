import moment from 'moment';
import { prop, Ref } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { statuses } from './status.constant';
import { User } from '../users/user';

export class CommonTask extends Base {
	@prop({ default: moment.now })
	createdAt: Date | moment.Moment;

	@prop({ enum: statuses, default: statuses.waiting, type: String })
	status: statuses;

	@prop({ default: null })
	deletedAt: Date | moment.Moment;

	// Время последнего выполения задачи
	@prop({ default: null })
	lastHandleAt: Date | moment.Moment;

	@prop()
	_error: any;

	@prop({ ref: User, refType: Schema.Types.ObjectId })
	user?: Ref<User>;
}
