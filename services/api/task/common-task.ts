import moment from 'moment';
import { prop, Ref } from '@typegoose/typegoose';
import { Schema, Types } from 'mongoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { statuses } from './status.constant';
import { User } from '../users/user';
import { model } from '../../../lib/inversify-typegoose/model.decorator';
import { CompositeTaskInterface } from './composite-task.interface';

@model()
export class CommonTask extends Base implements CompositeTaskInterface {
	@prop({ default: moment.now, type: Date })
	createdAt: Date | moment.Moment;

	@prop({ enum: statuses, default: statuses.waiting, type: String })
	status: statuses;

	@prop({ default: null, type: Date })
	deletedAt: Date | moment.Moment;

	// Время последнего выполения задачи
	@prop({ default: null, type: Date })
	lastHandleAt: Date | moment.Moment;

	@prop()
	_error: any;

	@prop({ ref: User, refType: Schema.Types.ObjectId })
	user?: Ref<User>;

	@prop()
	parentTaskId?: Types.ObjectId;

	@prop({ default: [] })
	subTasksErrors: object[];

	@prop({ required: true, default: 0 })
	finishedCount: number;

	@prop({ required: true, default: 0 })
	tasksCount: number;
}
