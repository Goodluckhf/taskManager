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

		const task = new CommentsByStrategyTask(vkUserMock, {}, {});

		const strategy = { items: [{ userFakeId: 0 }, { userFakeId: 1 }, { userFakeId: 2 }] };
		await expect(task.handle({ postLink: 'testLink', strategy })).to.be.rejectedWith(
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

		const task = new CommentsByStrategyTask(vkUserMock, commentsServiceMock, {});
		const strategy = { items: [{ userFakeId: 0 }, { userFakeId: 1 }] };
		await task.handle({ postLink: 'testLink', strategy });

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

		const task = new CommentsByStrategyTask(vkUserMock, commentsServiceMock, likesServiceMock);
		const strategy = { items: [{ userFakeId: 0, likesCount: 1 }, { userFakeId: 1 }] };
		await task.handle({ postLink: 'testLink', strategy });

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

		const task = new CommentsByStrategyTask(vkUserMock, commentsServiceMock, {});
		const strategy = {
			items: [{ userFakeId: 0 }, { userFakeId: 1, replyToCommentNumber: 0 }],
		};
		await task.handle({ postLink: 'testLink', strategy });
		expect(expectedReplyTo).to.be.equals('id_0');
	});
});
