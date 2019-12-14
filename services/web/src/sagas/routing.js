import { takeEvery, call, fork, cancel } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { LOCATION_CHANGE } from 'connected-react-router';
import { update as updateGroup } from './group';
import { update as updateAutolikes } from './autolikes';
import { update as updateWallSeek } from './wallSeek';
import { update as updateCommentsStrategy } from './commentsByStrategy';
import { update as updateVkUsers } from './vkUsers';
import { getUserData, updateBalance } from './auth';
import { update } from './billing';

const mapperPathToUpdateFunction = {
	'/groups': {
		function: updateGroup,
		loop: true,
	},
	'/autolikes': {
		function: updateAutolikes,
		loop: true,
	},
	'/wallseek': {
		function: updateWallSeek,
		loop: true,
	},
	'/comments-by-strategy': {
		function: updateCommentsStrategy,
		loop: true,
	},
	'/vk-users': {
		function: updateVkUsers,
		loop: true,
	},
	'/settings': {
		function: getUserData,
		loop: false,
	},
	'/balance': {
		function: update,
		loop: true,
	},
};

const loopUpdate = function*(updateFunction, interval) {
	while (true) {
		yield updateFunction();
		yield call(delay, interval);
	}
};

const loopUpdateBalance = function*() {
	while (true) {
		yield updateBalance();
		yield call(delay, 5000);
	}
};

export default function*() {
	const interval = 5 * 1000;
	let currentLoopTask = null;
	let currentBalanceTask = null;

	// @TODO: пока идет 2 запроса
	// Но сейчас это вообще не узкое место
	yield getUserData();

	yield takeEvery(LOCATION_CHANGE, function*({ payload: { location } }) {
		if (currentLoopTask) {
			yield cancel(currentLoopTask);
			currentLoopTask = null;
		}

		if (currentBalanceTask) {
			yield cancel(currentBalanceTask);
			currentBalanceTask = null;
		}

		const updateOption = mapperPathToUpdateFunction[location.pathname];
		if (!updateOption) {
			return;
		}

		currentBalanceTask = yield fork(loopUpdateBalance);

		if (!updateOption.loop) {
			yield updateOption.function();
			return;
		}

		currentLoopTask = yield fork(loopUpdate, updateOption.function, interval);
	});
}
