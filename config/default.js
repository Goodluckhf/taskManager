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
	
	likesTask: {
		queue   : 'tasks.likes',
		timeout : 60000,
		prefetch: 1,
	},
	
	accountTask: {
		queue   : 'tasks.account',
		timeout : 60000,
		prefetch: 1,
	},
	
	commentsTask: {
		queue   : 'tasks.comments',
		timeout : 60000,
		prefetch: 1,
	},
	
	likePro: {
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
	
	cron: {
		interval: 60000,
	},
	
	vkAlert: {
		chat_id: 215,
	},
};
