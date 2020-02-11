// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotEnv = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

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
		serverTimeout: process.env.TASK_SERVER__TIMEOUT,
		prefetch: 1,
	},

	// В секундах
	groupJoinTask: {
		background: {
			min: parseInt(process.env.GROUP_JOIN_TASK__BG__MIN, 10),
			max: parseInt(process.env.GROUP_JOIN_TASK__BG__MAX, 10),
		},
		allUsers: {
			min: parseInt(process.env.GROUP_JOIN_TASK__ALL_USERS__MIN, 10),
			max: parseInt(process.env.GROUP_JOIN_TASK__ALL_USERS__MAX, 10),
		},
	},

	fakeActivityTask: {
		interval: parseInt(process.env.FAKE_ACTIVITY_TASK__INTERVAL, 10),
	},

	commentComplainTask: {
		usersRatio: parseInt(process.env.COMMENT_COMPLAIN_TASK__RATIO, 10),
		tasksPerMinute: parseInt(process.env.COMMENT_COMPLAIN_TASK__TASKS_PER_MINUTE, 10),
	},

	postCommentsTask: {
		retriesLimit: process.env.POST_COMMENTS_TASK__RETRY_LIMIT,
		translitEnabled: process.env.POST_COMMENTS_TASK__TRANSLIT_ENABLED === 'true',
		distribution: {
			replyMax: parseInt(process.env.POST_COMMENTS_TASK__DISTRIBUTION__REPLY_MAX, 10),
			commonMax: parseInt(process.env.POST_COMMENTS_TASK__DISTRIBUTION__COMMON_MAX, 10),
			countWithoutDelay: parseInt(
				process.env.POST_COMMENTS_TASK__DISTRIBUTION__COUNT_WITHOU_DELAY,
				10,
			),
		},
	},

	checkVkUserTask: {
		retriesLimit: process.env.CHECK_VK_USER_TASK__RETRY_LIMIT,
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
		formInputsOrder: {
			postLink: process.env.SMM_BRO__FORM_INPUTS_ORDER__LINK,
			likes: process.env.SMM_BRO__FORM_INPUTS_ORDER__LIKES,
			comments: process.env.SMM_BRO__FORM_INPUTS_ORDER__COMMENTS,
			reposts: process.env.SMM_BRO__FORM_INPUTS_ORDER___REPOSTS,
			addButton: process.env.SMM_BRO__FORM_INPUTS_ORDER___ADD_BUTTON,
		},
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
		tasksPrefetch: process.env.CRON__TASKS_PREFETCH,
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
