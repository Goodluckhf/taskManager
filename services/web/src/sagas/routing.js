import { takeEvery, put }  from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';
import { listRequest as requestGroupList }     from '../actions/groups';
import { requestList as requestAutolikesList } from '../actions/autolikes';

export default function* () {
	yield takeEvery(LOCATION_CHANGE, function* ({ payload: { location } }) {
		if (location.pathname === '/groups') {
			yield put(requestGroupList());
			return;
		}
		
		if (location.pathname === '/autolikes') {
			yield put(requestAutolikesList());
		}
	});
}

