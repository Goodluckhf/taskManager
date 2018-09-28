import { takeEvery, put, call, fork, cancel }  from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { LOCATION_CHANGE } from 'connected-react-router';
import { listRequest as groupListRequest }     from '../actions/groups';
import { listRequest as autolikesListRequest } from '../actions/autolikes';
import { listRequest as wallSeekListRequest }  from '../actions/wallSeek';

const mapperPathToActionCreator = {
	'/groups'   : groupListRequest,
	'/autolikes': autolikesListRequest,
	'/wallseek' : wallSeekListRequest,
};

const loopUpdate = function* (actionCreator, interval) {
	while (true) {
		yield put(actionCreator());
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
		
		const actionCreator = mapperPathToActionCreator[location.pathname];
		if (!actionCreator) {
			return;
		}
		
		currentLoopTask = yield fork(loopUpdate, actionCreator, interval);
	});
}

