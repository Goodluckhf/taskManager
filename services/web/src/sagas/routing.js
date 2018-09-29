import { takeEvery, call, fork, cancel }  from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { LOCATION_CHANGE } from 'connected-react-router';
import { update as updateGroup }     from './group';
import { listRequest as autolikesListRequest } from '../actions/autolikes';
import { listRequest as wallSeekListRequest }  from '../actions/wallSeek';

const mapperPathToUpdateFunction = {
	'/groups'   : updateGroup,
	'/autolikes': autolikesListRequest,
	'/wallseek' : wallSeekListRequest,
};

const loopUpdate = function* (updateFunction, interval) {
	while (true) {
		yield updateFunction();
		yield call(delay, interval);
	}
};

export default function* () {
	const interval = 5 * 1000;
	let currentLoopTask = null;
	yield takeEvery(LOCATION_CHANGE, function* ({ payload: { location } }) {
		if (currentLoopTask) {
			yield cancel(currentLoopTask);
		}
		
		const updateFunction = mapperPathToUpdateFunction[location.pathname];
		if (!updateFunction) {
			return;
		}
		
		currentLoopTask = yield fork(loopUpdate, updateFunction, interval);
	});
}

