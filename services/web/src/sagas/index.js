import { fork } from 'redux-saga/effects';
import groupSaga from './group';
import autolikes from './autolikes';
import wallSeek from './wallSeek';
import commentsByStrategy from './commentsByStrategy';
import routing from './routing';
import auth from './auth';
import billing from './billing';
import vkUsers from './vkUsers';

export default function* rootSage() {
	yield fork(auth);
	yield fork(groupSaga);
	yield fork(autolikes);
	yield fork(routing);
	yield fork(wallSeek);
	yield fork(commentsByStrategy);
	yield fork(vkUsers);
	yield fork(billing);
}
