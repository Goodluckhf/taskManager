import { Map } from 'immutable';
import { fatalError } from '../store/initialState';
import { FATAL_ERROR } from '../actions/fatalError';
//@TODO: Сделать нормально
export default (state = fatalError, { type, payload }) => {
	if (type === FATAL_ERROR) {
		return Map(payload.error);
	}

	return state;
};
