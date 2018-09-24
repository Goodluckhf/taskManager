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
		timeout : 120000,
		prefetch: 1,
	},
	
	likesTask: {
		checkingDelay: 2, // В минутах
		likesToCheck : 30,
		serviceOrder : ['likesPro', 'z1y1x1', 'likest'],
	},
	
	commentsTask: {
		checkingDelay  : 2, // В минутах
		commentsToCheck: 7,
		serviceOrder   : ['z1y1x1', 'likest'],
	},
	
	// @TODO: Поправить
	accountTask: {
		method: 'tasks.account',
	},
	
	likePro: {
		login   : '!login!',
		password: '!password!',
	},
	
	likest: {
		login   : '!login!',
		password: '!password!',
	},
	
	z1y1x1: {
		token: '!token!',
	},
	
	vkApi: {
		token  : '!token!',
		timeout: 10000,
	},
	
	rucaptcha: {
		token: '!token!',
	},
	
	cron: {
		interval: 60000,
	},
	
	vkAlert: {
		chat_id: 215,
	},
};
