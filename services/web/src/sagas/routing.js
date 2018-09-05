import { takeEvery, put }  from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';
import { requestList }     from '../actions/groups';

export default function* () {
	yield takeEvery(LOCATION_CHANGE, function* ({ payload: { location } }) {
		if (location.pathname === '/groups') {
			yield put(requestList());
		}
	});
}

