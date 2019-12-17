import bluebird from 'bluebird';

// eslint-disable-next-line import/prefer-default-export
export const authorize = async (page, logger, captcha, { login, password, proxy }) => {
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
	const waitForCaptchaPromise = page.waitFor(() => !!document.querySelector('.recaptcha iframe'));
	await page.click('#login_button');
	await bluebird.any([loginNavigationPromise, waitForCaptchaPromise]);

	const hasCaptcha = await page.evaluate(() => !!document.querySelector('.recaptcha iframe'));
	if (hasCaptcha) {
		try {
			const captchaUrl = await page.evaluate(() =>
				document.querySelector('.recaptcha iframe').getAttribute('src'),
			);
			const urlObject = new URL(captchaUrl);
			const siteKey = urlObject.searchParams.get('k');
			const result = await captcha.solveRecaptchaV2({
				pageUrl: 'https://vk.com/login',
				siteKey,
			});
			const captchaNavigationPromise = page.waitForNavigation();
			await page.evaluate(
				token => {
					document.querySelector('.recaptcha .g-recaptcha-response').value = token;
					document.querySelector('#quick_recaptcha').value = token;
					document.querySelector('#quick_login_form').submit();
				},
				result,
				siteKey,
			);
			await captchaNavigationPromise;
		} catch (error) {
			error.code = 'captcha_failed';
			error.login = login;
			error.canRetry = true;
			throw error;
		}
	}

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
