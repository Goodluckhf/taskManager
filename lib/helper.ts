import { URL } from 'url';

/**
 * @param {Array<T>} array
 * @returns {{}}
 * @example ['val1', 'val2'] => {val1: 'val1', val2: 'val2'}
 */
// eslint-disable-next-line import/prefer-default-export, arrow-parens
export const arrayToHash = array =>
	array.reduce(
		(object, item) => ({
			...object,
			[item]: item,
		}),
		{},
	);

const urlRegExp = new RegExp(/^((http|https):\/\/)?vk.com\/([0-9a-z_.]+)/);

/**
 * @param {String|Number} _id
 * @return {Number} 123123
 */
export const groupIdForLink = _id => {
	const id = parseInt(_id, 10);

	if (id > 0) {
		return id;
	}

	return id * -1;
};

/**
 * @param {String|Number} _id
 * @return {Number} -123123
 */
export const groupIdForApi = _id => {
	const id = parseInt(_id, 10);

	if (id < 0) {
		return id;
	}

	return id * -1;
};

/**
 * Для API VK.com
 * по ссылке на группу выдает обьект с ключем "owner_id" || "domain"
 * @param {String} href
 * @param {boolean} [withMinus = true]
 * @return {{owner_id?: string, domain?: string}}
 */
export const groupForVkApiByHref = (href, withMinus = true) => {
	const data: any = {};
	const matchResult = href.match(urlRegExp);
	let group = '';

	if (!matchResult) {
		group = href;
	} else {
		group = matchResult[matchResult.length - 1];
	}

	const groupMatched = group.match(/^(public|club)([0-9]+)/);

	if (groupMatched) {
		const ownerId = `-${groupMatched[groupMatched.length - 1]}`;
		data.owner_id = parseInt(ownerId, 10);
		if (!withMinus) {
			data.owner_id = groupIdForLink(data.owner_id);
		}
	} else {
		data.domain = group;
	}

	return data;
};

/**
 * По результату метода "groupForVkApiByHref"
 * Возвращает полную ссылку
 * @param {{owner_id?: string, domain?: string}} group
 * @return {String}
 */
export const hrefByGroupObjVk = group => {
	const href = 'https://vk.com/';
	if (typeof group.owner_id !== 'undefined') {
		return `${href}club${this.groupIdForLink(group.owner_id)}`;
	}

	return `${href}${group.domain}`;
};

export const hrefByGroupId = (_id: string): string => {
	const id = this.groupIdForLink(_id);

	return `https://vk.com/club${id}`;
};

/**
 * @param {Object} group
 * @param {Number} group.owner_id
 * @param {Number} group.id
 * @return {string}
 */
export const postLinkByGroup = group => `https://vk.com/wall${group.owner_id}_${group.id}`;

/**
 * @param {String} link
 * @return {String}
 */
export const postIdByLink = link => link.replace('https://vk.com/wall', '');

/**
 * По ссылке на пост
 * Возвращает id группы
 */
export const groupIdByPostLink = (postLink: string): string =>
	postLink.replace('https://vk.com/wall', '').split('_')[0];

/**
 * Проверяет есть ли ссылка на группу в посте
 * @param {Object} post
 * @param {Number} publicId
 * @return {Boolean}
 */
export const postHasLink = (post, publicId) => {
	const cleanPublicId = groupIdForLink(publicId);
	const regExp = new RegExp(`\\[club${cleanPublicId}\\|`);
	return regExp.test(post.text);
};

/**
 * Добавляет http протокол если нет протокола
 * @param link
 * @return {*}
 */
export const addProtocol = link => {
	if (/^(http|https):\/\//.test(link)) {
		return link;
	}

	return `http://${link}`;
};

export const linkByVkUserId = id => `https://vk.com/id${id}`;

/**
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
export const getRandom = (min, max) => {
	// eslint-disable-next-line no-mixed-operators
	const rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
};

/**
 * @param {Number} size
 * @return {String}
 */
export const getRandomNumberString = size =>
	Array.from({ length: size }).reduce(str => `${str}${getRandom(0, 9)}`, '');

export const cleanLink = _link => {
	let link = decodeURIComponent(_link);
	if (/\/away\.php/.test(_link)) {
		const url = new URL(/^https?:\/\/vk\.com/.test(_link) ? _link : `http://vk.com${_link}`);
		const to = url.searchParams.get('to');
		if (to) {
			link = decodeURIComponent(to);
		}
	}

	return link
		.replace(/^https?:\/\//, '')
		.replace(/\/$/, '')
		.replace(/\?$/, '');
};
