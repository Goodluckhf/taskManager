const path = require('path');
const dotEnv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
	dotEnv.config({ path: path.resolve(process.cwd(), '.env.mongodb') });
	dotEnv.config({ path: path.resolve(process.cwd(), '.env.rabbit') });
	dotEnv.config();
}

module.exports = {
	jwt: {
		secret: process.env.JWT__SECRET,
	},

	db: {
		connectionURI: process.env.MONGODB_URL,
		reconnectInterval: process.env.MONGODB__RECONNECTING_INTERVAL,
	},

	api: {
		port: 3000,
		host: 'api',
	},

	push: {
		port: 3000,
		host: 'push',
		hostWildCard: process.env.PUSH__HOST_WILD_CARD.split(','),
	},

	uMetrics: {
		port: process.env.U_METRICS__PORT,
		ttl: process.env.U_METRICS__TTL,
	},

	rabbit: {
		host: 'rabbit',
		port: 5672,
		login: process.env.RABBITMQ_DEFAULT_USER,
		password: process.env.RABBITMQ_DEFAULT_PASS,
		reconnectInterval: 3000,
	},

	tasksQueue: {
		name: 'tasks',
		timeout: process.env.TASK_QUEUE__TIMEOUT,
		prefetch: 1,
	},

	likesTask: {
		checkingDelay: process.env.LIKES_TASK__CHECKING_DELAY, // В минутах
		likesToCheck: process.env.LIKES_TASK__LIKES_TO_CHECK,
		serviceOrder: process.env.LIKES_TASK__SERVICE_ORDER.split(','),
	},

	repostsTask: {
		checkingDelay: process.env.REPOSTS_TASK__CHECKING_DELAY, // В минутах
		repostsToCheck: process.env.REPOSTS_TASK__REPOSTS_TO_CHECK,
		serviceOrder: process.env.REPOSTS_TASK__SERVICE_ORDER.split(','),
	},

	commentsTask: {
		checkingDelay: process.env.COMMENTS_TASK__CHECKING_DELAY, // В минутах
		commentsToCheck: process.env.COMMENTS_TASK__COMMENTS_TO_CHECK,
		serviceOrder: process.env.COMMENTS_TASK__SERVICE_ORDER.split(','),
	},

	checkBalanceTask: {
		interval: parseInt(process.env.CHECK_BALANCE_TASK__INTERVAL, 10),
		ratio: parseFloat(process.env.CHECK_BALANCE_TASK__RATIO),
	},

	// @TODO: Поправить
	accountTask: {
		method: 'tasks.account',
	},

	likePro: {
		login: process.env.LIKE_PRO__LOGIN,
		password: process.env.LIKE_PRO__PASSWORD,
	},

	likest: {
		login: process.env.LIKEST__LOGIN,
		password: process.env.LIKEST__PASSWORD,
	},

	z1y1x1: {
		token: process.env.Z1Y1X1__TOKEN,
		timeout: process.env.Z1Y1X1__TIMEOUT,
	},

	smmBro: {
		login: process.env.SMM_BRO__LOGIN,
		password: process.env.SMM_BRO__PASSWORD,
	},

	vkApi: {
		token: process.env.VK_API__TOKEN,
		id: process.env.VK_API__ID,
		timeout: process.env.VK_API__TIMEOUT,
	},

	rucaptcha: {
		token: process.env.RUCAPTCHA__TOKEN,
	},

	cron: {
		interval: process.env.CRON__INTERVAL,
	},

	prices: {
		like: parseInt(process.env.PRICES__LIKE, 10),
		repost: parseInt(process.env.PRICES__REPOST, 10),
		comment: parseInt(process.env.PRICES__COMMENT, 10),
	},

	rubbleRatio: process.env.RUBBLE_RATIO,

	yandex: {
		token: process.env.YANDEX_MONEY__TOKEN,
	},
};
