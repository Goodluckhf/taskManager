require('dotenv').config();

module.exports = {
	db: {
		connectionURI    : 'mongodb://mongo/tasks',
		reconnectInterval: 1000,
	},
	
	api: {
		port: 3000,
		host: 'api',
	},
	
	rabbit: {
		host             : 'rabbit',
		port             : 5672,
		login            : process.env.RABBITMQ_DEFAULT_USER,
		password         : process.env.RABBITMQ_DEFAULT_PASS,
		reconnectInterval: 3000,
	},
	
	autoLikesTask: {
		likesInterval: 70,
	},
	
	tasksQueue: {
		name    : 'tasks',
		timeout : process.env.TASK_QUEUE__TIMEOUT,
		prefetch: 1,
	},
	
	likesTask: {
		checkingDelay: process.env.LIKES_TASK__CHECKING_DELAY, // В минутах
		likesToCheck : process.env.LIKES_TASK__LIKES_TO_CHECK,
		serviceOrder : process.env.LIKES_TASK__SERVICE_ORDER.split(','),
	},
	
	commentsTask: {
		checkingDelay  : process.env.COMMENTS_TASK__CHECKING_DELAY, // В минутах
		commentsToCheck: process.env.COMMENTS_TASK__COMMENTS_TO_CHECK,
		serviceOrder   : process.env.COMMENTS_TASK__SERVICE_ORDER.split(','),
	},
	
	// @TODO: Поправить
	accountTask: {
		method: 'tasks.account',
	},
	
	likePro: {
		login   : process.env.LIKE_PRO__LOGIN,
		password: process.env.LIKE_PRO__PASSWORD,
	},
	
	likest: {
		login   : process.env.LIKEST__LOGIN,
		password: process.env.LIKEST__PASSWORD,
	},
	
	z1y1x1: {
		token: process.env.Z1Y1X1__TOKEN,
	},
	
	vkApi: {
		token  : process.env.VK_API__TOKEN,
		timeout: process.env.VK_API__TIMEOUT,
	},
	
	rucaptcha: {
		token: process.env.RUCAPTCHA__TOKEN,
	},
	
	cron: {
		interval: process.env.CRON__INTERVAL,
	},
	
	vkAlert: {
		chat_id: process.env.VK_ALERT__CHAT_ID,
	},
};
