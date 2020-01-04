import { ObjectableInterface } from '../../../lib/internal.types';

export interface TaskServiceInterface {
	delete(id: string);

	setPending(id: string);

	finish(id: string);

	finishWithError(id: string, error: ObjectableInterface);
}
