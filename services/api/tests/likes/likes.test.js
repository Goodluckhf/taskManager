import { expect }    from 'chai';
import config        from 'config';
import mongoose      from '../../../../lib/mongoose';
import LikesTask     from '../../tasks/LikesTask';

const loggerMock = { info() {}, error() {}, warn() {} };

describe('likeTask', () => {
	it('Should call rpc method with correct request', async () => {
		const taskDocument = mongoose.model('LikesTask').createInstance({
			likesCount: 10,
			postLink  : 'testLink',
			service   : 'testService',
		});
		
		const rpcClient = {
			async call(request) {
				expect(request.method).to.be.equals('setLikes_testService');
				expect(request.args.likesCount).to.be.equals(10);
				expect(request.args.postLink).to.be.equals('testLink');
			},
		};
		
		const likesTask = new LikesTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		likesTask.getCredentialsForService = () => ({});
		
		await likesTask.handle();
	});
	
	it('should set status finish if error', async () => {
		const taskDocument = mongoose.model('LikesTask').createInstance({
			likesCount: 10,
			postLink  : 'testLink',
			service   : 'testService',
		});
		
		const rpcClient = {
			async call() {
				throw new Error('fail');
			},
		};
		
		const likesTask = new LikesTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		likesTask.getCredentialsForService = () => ({});
		const promise = likesTask.handle();
		await expect(promise).to.rejectedWith(/fail/);
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
	});
	
	it('should set status finish if success', async () => {
		const taskDocument = mongoose.model('LikesTask').createInstance({
			likesCount: 10,
			postLink  : 'testLink',
			service   : 'testService',
		});
		
		const rpcClient = {
			async call() {
				return true;
			},
		};
		
		const likesTask = new LikesTask({
			logger: loggerMock,
			config,
			taskDocument,
			rpcClient,
		});
		
		likesTask.getCredentialsForService = () => ({});
		const promise = likesTask.handle();
		await expect(promise).to.be.fulfilled;
		expect(taskDocument.status).to.be.equals(mongoose.model('Task').status.finished);
	});
});
