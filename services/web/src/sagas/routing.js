import { takeEvery, call, fork, cancel } from 'redux-saga/effects';
import { delay }                     from 'redux-saga';
import { LOCATION_CHANGE }           from 'connected-react-router';
import { update as updateGroup }     from './group';
import { update as updateAutolikes } from './autolikes';
import { update as updateWallSeek }  from './wallSeek';
import { getUserData }               from './auth';

const mapperPathToUpdateFunction = {
	'/groups': {
		function: updateGroup,
		loop    : true,
	},
	'/autolikes': {
		function: updateAutolikes,
		loop    : true,
	},
	'/wallseek': {
		function: updateWallSeek,
		loop    : true,
	},
	'/settings': {
		function: getUserData,
		loop    : false,
	},
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
			currentLoopTask = null;
		}
		
		const updateOption = mapperPathToUpdateFunction[location.pathname];
		if (!updateOption) {
			return;
		}
		
		if (!updateOption.loop) {
			yield updateOption.function();
			return;
		}
		
		currentLoopTask = yield fork(loopUpdate, updateOption.function, interval);
	});
}

