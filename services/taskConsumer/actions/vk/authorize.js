// eslint-disable-next-line import/prefer-default-export
export const authorize = async (page, logger, { login, password, proxy }) => {
	try {
		await page.goto('https://vk.com/login', {
			waitUntil: 'networkidle2',
		});
	} catch (error) {
		if (/ERR_PROXY_CONNECTION_FAILED/.test(error.message)) {
			error.code = 'proxy_failure';
			error.proxy = proxy;
		}

		throw error;
	}

	logger.info({
		message: 'Прокси жив (зашли на страницу авторизации)',
		proxy,
	});

	await page.evaluate(
		(_login, _password) => {
			document.querySelector('#email').value = _login;
			document.querySelector('#pass').value = _password;
		},
		login,
		password,
	);

	const loginNavigationPromise = page.waitForNavigation();
	await page.click('#login_button');
	await loginNavigationPromise;

	const loginFailedElement = await page.$('#login_message .error');
	if (loginFailedElement) {
		const error = new Error('Account credentials is invalid');
		error.login = login;
		error.code = 'login_failed';
		error.canRetry = false;
		throw error;
	}

	const blockedElement = await page.$('#login_blocked_wrap');
	if (blockedElement) {
		const error = new Error('Account is blocked');
		error.login = login;
		error.code = 'blocked';
		error.canRetry = false;
		throw error;
	}
};
