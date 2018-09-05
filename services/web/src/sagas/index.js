import { fork }  from 'redux-saga/effects';
import groupSaga from './group';
import autolikes from './autolikes';
import routing   from './routing';

export default function* rootSage() {
	yield fork(groupSaga);
	yield fork(autolikes);
	yield fork(routing);
}
