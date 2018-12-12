import bluebird from 'bluebird';

import logger from '../../lib/logger';
import initModels from './model';
import db from '../../lib/db';
import mongoose from '../../lib/mongoose';

(async () => {
	// Подключаемся к бд
	const dbConnection = db.connect();
	// Инициализируем модели
	initModels(dbConnection);
	const Task = mongoose.model('Task');
	const idsObject = await Task.find({
		$and: [
			{ __t: { $ne: 'AutoLikesTask' } },
			{ __t: { $ne: 'CheckWallBanTask' } },
			{ __t: { $ne: 'CheckBalanceTask' } },
		],
	})
		.select({
			_id: 1,
		})
		.lean()
		.exec();

	logger.info({
		count: idsObject.length,
		message: 'Start migration step1',
	});

	await bluebird.map(
		idsObject,
		async ({ _id }) => {
			try {
				const task = await Task.findById(_id);
				if (task.likesCount) {
					task.count = task.likesCount;
				}

				if (task.commentsCount) {
					task.count = task.commentsCount;
				}

				if (task.repostsCount) {
					task.count = task.repostsCount;
				}
				await task.save();
			} catch (error) {
				logger.error({
					error,
					message: 'ошибка при миграции',
					_id,
				});
			}
		},
		{ concurrency: 100 },
	);

	logger.info({
		message: 'Finish migration step1',
	});
})();
