import { fork } from 'redux-saga/effects';
import groupSaga from './group';
import autolikes from './autolikes';
import wallSeek from './wallSeek';
import routing from './routing';
import auth from './auth';
import billing from './billing';

export default function* rootSage() {
	yield fork(auth);
	yield fork(groupSaga);
	yield fork(autolikes);
	yield fork(routing);
	yield fork(wallSeek);
	yield fork(billing);
}
