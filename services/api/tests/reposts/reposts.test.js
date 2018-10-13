import { expect }    from 'chai';
import config        from 'config';
import mongoose      from '../../../../lib/mongoose';
import BaseTaskError from '../../api/errors/tasks/BaseTaskError';
import RepostsTask   from '../../tasks/RepostsTask';

const loggerMock = { info() {}, error() {}, warn() {} };

describe('repostsTask', () => {
	it('Should call rpc method with correct request', async () => {
		const taskDocument = mongoose.model('RepostsTask').createInstance({
			repostsCount: 10,
			postLink    : 'testLink',
			service     : 'testService',
		});
		
		const rpcClient = {
			async call(request) {
				expect(request.method).to.be.equals('setReposts_testService');
				expect(request.args.repostsCount).to.be.equals(10);
				expect(request.args.postLink).to.be.equals('testLink');
			},
		};
		
		const task = new RepostsTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		task.getCredentialsForService = () => ({});
		
		await task.handle();
	});
	
	it('should set status finish if error', async () => {
		const taskDocument = mongoose.model('RepostsTask').createInstance({
			repostsCount: 10,
			postLink    : 'testLink',
			service     : 'testService',
		});
		
		const rpcClient = {
			async call() {
				throw new Error('fail');
			},
		};
		
		const task = new RepostsTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		task.getCredentialsForService = () => ({});
		const promise = task.handle();
		await expect(promise).to.rejectedWith(BaseTaskError);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument._error).to.be.not.null;
	});
	
	it('should set status finish if success', async () => {
		const taskDocument = mongoose.model('RepostsTask').createInstance({
			repostsCount: 10,
			postLink    : 'testLink',
			service     : 'testService',
		});
		
		const rpcClient = {
			async call() {
				return true;
			},
		};
		
		const task = new RepostsTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		task.getCredentialsForService = () => ({});
		const promise = task.handle();
		await expect(promise).to.be.fulfilled;
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
		expect(taskDocument._error).to.be.null;
	});
});
