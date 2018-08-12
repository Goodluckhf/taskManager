import config from 'config';
import axios  from 'axios';
//import bluebird from 'bluebird';
import logger from '../../../lib/logger';
//import VkApi  from '../../../lib/VkApi';
//import { postLinkByGroup, postHasLink } from '../../../lib/helper';

const baseUrl = `http://${config.get('api.host')}:${config.get('api.port')}/api`;
//const vkApi = new VkApi(config.get('vkApi.token'));

export const getActualTasks = async () => {
	const { data: { data } } = await axios.get(`${baseUrl}/task`);
	return data;
};


export const processTask = async (task) => {
	logger.info({ task });
	// @TODO: Сделать через RPC и браузерную проверку поста
	/*const posts = await vkApi.getPosts({
		publicId: task.group.publicId,
		count   : 2,
	});
	logger.info({ posts });
	
	// Пост может быть закреплен
	// Поэтому берем либо первый либо 2-ой
	const postToCheck = posts[0].is_pinned === 1 ? posts[1] : posts[0];
	
	
	if (!postHasLink(postToCheck, task.targetLink)) {
	
	}
	const data = {
		action    : 'likes',
		postLink  : postLinkByGroup(postToLike),
		likesCount: task.likes,
	};
	logger.info({
		data
	});
	await bluebird.delay(1000);*/
	//eslint-disable-next-line
};
