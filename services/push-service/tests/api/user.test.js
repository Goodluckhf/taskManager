import { expect } from 'chai';
import config from 'config';
import _ from 'lodash';
import mongoose from '../../../../lib/mongoose';
import UserApi from '../../api/UserApi';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('UserApi', function() {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});

	it('Should add if new push and show count', async () => {
		const api = new UserApi(config, loggerMock);

		await api.addPush({
			push: 'test',
		});

		const count = await mongoose.model('User').count({
			push: 'test',
		});
		expect(count).to.be.equals(1);

		const apiCount = await api.count();
		expect(apiCount).to.be.equals(1);
	});
});
