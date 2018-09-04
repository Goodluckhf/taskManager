import { fork }  from 'redux-saga/effects';
import groupSaga from './group';
import autolikes from './autolikes';

export default function* rootSage() {
	yield fork(groupSaga);
	yield fork(autolikes);
}
