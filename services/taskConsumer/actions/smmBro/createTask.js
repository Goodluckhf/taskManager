const taskTypetoInputIndexHash = {
	likes: 2,
	comments: 3,
	reposts: 6,
};

/**
 * @param page
 * @param {Object} args
 * @param {String} args.postLink
 * @param {Number | String} args.count
 * @param {String} args.type
 * @return {Promise<Array.<String>>}
 */
const createTask = async (page, { postLink, count, type }) => {
	const inputs = await page.$$('#app form input');
	await inputs[0].type(postLink);

	const inputIndex = taskTypetoInputIndexHash[type];
	if (!inputIndex) {
		throw new Error(`Нет такого типа (${type})`);
	}

	await inputs[inputIndex].type(`${count}`);

	await page.click('#app form button');

	await page.waitForFunction(() => {
		const errors = document.querySelectorAll('.alertify-logs .error.show');
		if (errors.length) {
			return true;
		}

		const success = document.querySelector('.alertify-logs .success.show');
		return !!success;
	});

	return page.evaluate(() =>
		[...document.querySelectorAll('.alertify-logs .error.show')].map(
			element => element.innerText,
		),
	);
};

export default createTask;
