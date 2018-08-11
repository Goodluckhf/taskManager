/**
 * @param {Array<T>} array
 * @returns {{}}
 * @example ['val1', 'val2'] => {val1: 'val1', val2: 'val2'}
 */
// eslint-disable-next-line import/prefer-default-export, arrow-parens
export const arrayToHash = (array) => {
	return array.reduce((object, item) => {
		return {
			...object,
			[item]: item,
		};
	}, {});
};


const urlRegExp = new RegExp(/^((http|https):\/\/)?vk.com\/([0-9a-z_.]+)/);

/**
 * @param {String|Number} _id
 * @return {Number} 123123
 */
export const groupIdForLink = (_id) => {
	const id = parseInt(_id, 10);
	
	if (id > 0) {
		return id;
	}
	
	return id * (-1);
};

/**
 * @param {String|Number} _id
 * @return {Number} -123123
 */
export const groupIdForApi = (_id) => {
	const id = parseInt(_id, 10);
	
	if (id < 0) {
		return id;
	}
	
	return id * (-1);
};

/**
 * Для API VK.com
 * по ссылке на группу выдает обьект с ключем "owner_id" || "domain"
 * @param {String} href
 * @param {boolean} [withMinus = true]
 * @return {{owner_id?: string, domain?: string}}
 */
export const groupForVkApiByHref = (href, withMinus = true) => {
	const data        = {};
	const matchResult = href.match(urlRegExp);
	let group         = '';
	
	if (!matchResult) {
		group = href;
	} else {
		group = matchResult[matchResult.length - 1];
	}
	
	const groupMatched = group.match(/^(public|club)([0-9]+)/);
	
	if (groupMatched) {
		const ownerId = `-${groupMatched[groupMatched.length - 1]}`;
		data.owner_id = parseInt(ownerId, 10);
		if (withMinus) {
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
export const hrefByGroupObjVk = (group) => {
	const href = 'https://vk.com/';
	if (typeof group.owner_id !== 'undefined') {
		return `${href}club${this.groupIdForLink(group.owner_id)}`;
	}
	
	return `${href}${group.domain}`;
};

/**
 * @param {String|Number} _id
 * @return {string}
 */
export const hrefByGroupId = (_id) => {
	const href = 'https://vk.com/club';
	const id = this.groupIdForLink(_id);
	
	return `${href}${id}`;
};
