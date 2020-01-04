import { ObjectableInterface } from '../../../lib/internal.types';
import { User } from '../users/user';

export interface TaskServiceInterface {
	deleteOwnedByUser(user: User, id: string);

	setPending(id: string);

	finish(id: string);

	finishWithError(id: string, error: ObjectableInterface);
}
