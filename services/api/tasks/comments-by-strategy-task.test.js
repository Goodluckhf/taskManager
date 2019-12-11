import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CommentsByStrategyTask from './CommentsByStrategyTask';

chai.use(chaiAsPromised);

describe('comments by strategy', () => {
	it('Should throw error if there is no enough active accounts', async () => {
		const vkUserMock = {
			findActive() {
				return Array.from({ length: 1 });
			},
		};

		const proxyMock = {
			getRandom() {
				return {
					url: 'url',
					login: 'login',
					password: 'pass',
				};
			},
		};

		const task = new CommentsByStrategyTask({
			ProxyModel: proxyMock,
			VkUserModel: vkUserMock,
			commentsService: {},
			likeService: {},
		});

		const commentsStrategy = [{ userFakeId: 0 }, { userFakeId: 1 }, { userFakeId: 2 }];
		await expect(task.handle({ postLink: 'testLink', commentsStrategy })).to.be.rejectedWith(
			/not enough accounts/,
		);
	});

	it('Should create task without reply', async () => {
		const vkUserMock = {
			findActive() {
				return Array.from({ length: 2 }).map((_, i) => ({
					login: `login${i}`,
					password: 'password',
				}));
			},
		};

		let commentsServiceMockInvoked = 0;

		const commentsServiceMock = {
			create() {
				commentsServiceMockInvoked++;
				return { commentsServiceMockInvoked };
			},
		};

		const proxyMock = {
			getRandom() {
				return {
					url: 'url',
					login: 'login',
					password: 'pass',
				};
			},
		};

		const task = new CommentsByStrategyTask({
			ProxyModel: proxyMock,
			VkUserModel: vkUserMock,
			commentsService: commentsServiceMock,
			likeService: {},
		});
		const commentsStrategy = [{ userFakeId: 0 }, { userFakeId: 1 }];
		await task.handle({ postLink: 'testLink', commentsStrategy });

		expect(commentsServiceMockInvoked).to.be.equals(2);
	});

	it('Should set likes if there is flag', async () => {
		const vkUserMock = {
			findActive() {
				return Array.from({ length: 2 }).map((_, i) => ({
					login: `login${i}`,
					password: 'password',
				}));
			},
		};

		const proxyMock = {
			getRandom() {
				return {
					url: 'url',
					login: 'login',
					password: 'pass',
				};
			},
		};

		let commentsServiceMockInvoked = 0;
		let likesServiceMockInvoked = 0;

		const commentsServiceMock = {
			create() {
				commentsServiceMockInvoked++;
				return { commentsServiceMockInvoked };
			},
		};

		const likesServiceMock = {
			setLikesToComment() {
				likesServiceMockInvoked++;
			},
		};

		const task = new CommentsByStrategyTask({
			ProxyModel: proxyMock,
			VkUserModel: vkUserMock,
			commentsService: commentsServiceMock,
			likeService: likesServiceMock,
		});
		const commentsStrategy = [{ userFakeId: 0, likesCount: 1 }, { userFakeId: 1 }];
		await task.handle({ postLink: 'testLink', commentsStrategy });

		expect(likesServiceMockInvoked).to.be.equals(1);
	});

	it('Should create task to reply', async () => {
		const vkUserMock = {
			findActive() {
				return Array.from({ length: 2 }).map((_, i) => ({
					login: `login${i}`,
					password: 'password',
				}));
			},
		};

		let commentId = 0;
		let expectedReplyTo = null;
		const commentsServiceMock = {
			create({ replyTo }) {
				if (replyTo) {
					expectedReplyTo = replyTo;
				}
				return { commentId: `id_${commentId++}` };
			},
		};

		const proxyMock = {
			getRandom() {
				return {
					url: 'url',
					login: 'login',
					password: 'pass',
				};
			},
		};

		const task = new CommentsByStrategyTask({
			ProxyModel: proxyMock,
			VkUserModel: vkUserMock,
			commentsService: commentsServiceMock,
			likeService: {},
		});
		const commentsStrategy = [{ userFakeId: 0 }, { userFakeId: 1, replyToCommentNumber: 0 }];
		await task.handle({ postLink: 'testLink', commentsStrategy });
		expect(expectedReplyTo).to.be.equals('id_0');
	});
});
