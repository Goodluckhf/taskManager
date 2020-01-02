import { Moment } from 'moment';

export interface DelayableTaskInterface {
	startAt: Date | Moment;
}
