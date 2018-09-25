import { takeEvery, put }  from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';
import { listRequest as groupListRequest }     from '../actions/groups';
import { listRequest as autolikesListRequest } from '../actions/autolikes';
import { listRequest as wallSeekListRequest }  from '../actions/wallSeek';

export default function* () {
	yield takeEvery(LOCATION_CHANGE, function* ({ payload: { location } }) {
		if (location.pathname === '/groups') {
			yield put(groupListRequest());
			return;
		}
		
		if (location.pathname === '/autolikes') {
			yield put(autolikesListRequest());
		}
		
		if (location.pathname === '/wallseek') {
			yield put(wallSeekListRequest());
		}
	});
}

