/**
 * @param page
 * @param {Object} args
 * @param {String} args.postLink
 * @param {Number | String} args.count
 * @param {String} args.type
 * @return {Promise<Array.<String>>}
 */
const createTask = async (page, { postLink, count, type, config }) => {
	const { formInputsOrder } = config;
	await page.click('#tabOldTitle');
	const inputs = await page.$$('#app form input');
	await inputs[formInputsOrder.postLink].type(postLink);

	const inputIndex = formInputsOrder[type];
	if (!inputIndex) {
		throw new Error(`Нет такого типа (${type})`);
	}

	await inputs[inputIndex].type(`${count}`);

	const buttons = await page.$$('#app form button');
	await buttons[formInputsOrder.addButton].click();

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
