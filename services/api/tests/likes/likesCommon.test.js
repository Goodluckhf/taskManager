import { expect } from 'chai';
import config   from 'config';
import _        from 'lodash';

import mongoose        from '../../../../lib/mongoose';
import LikesCommonTask from '../../tasks/LikesCommonTask';
import BaseTaskError   from '../../api/errors/tasks/BaseTaskError';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('LikesCommonTask', function () {
	beforeEach(() => {
		this.config = _.cloneDeep(config);
	});
	
	it('should throw error if cant setLikes with 1 service', async () => {
		this.config.likesTask = { serviceOrder: ['likest'] };
		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 10,
			postLink  : 'tetsLink',
		});
		const rpcClient = {
			call() {
				throw new Error('fail');
			},
		};
		
		const likesCommonTask = new LikesCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		const promise = likesCommonTask.handle();
		
		expect(promise).to.be.rejectedWith(BaseTaskError);
	});
	
	it('should not throw error if cant setLikes with first service but can with second', async () => {
		this.config.likesTask = { ...this.config.likesTask, serviceOrder: ['likest', 'z1y1x1'] };
		const user = mongoose.model('PremiumUser').createInstance({
			email   : 'test',
			password: 'test',
		});
		
		const taskDocument = mongoose.model('LikesCommon').createInstance({
			likesCount: 10,
			postLink  : 'tetsLink',
			status    : mongoose.model('Task').status.pendind,
			user,
		});
		
		const rpcClient = {
			call(request) {
				if (request.method === 'setLikes_z1y1x1') {
					return true;
				}
				
				throw new Error('fail');
			},
		};
		
		const likesCommonTask = new LikesCommonTask({
			rpcClient,
			logger: loggerMock,
			taskDocument,
			config: this.config,
		});
		
		
		const promise = likesCommonTask.handle();
		await expect(promise).to.be.fulfilled;
		expect(taskDocument._error).to.be.null;
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.checking);
	});
});
