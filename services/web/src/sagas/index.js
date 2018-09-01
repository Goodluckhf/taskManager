import { fork }  from 'redux-saga/effects';
import groupSaga from './group';

export default function* rootSage() {
	yield fork(groupSaga);
}
