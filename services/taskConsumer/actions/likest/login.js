const loginAction = async (page, captcha, login, password) => {
	const captchaSrc = await page.evaluate(() => {
		const img = document.querySelector('.captcha img');
		return img.src;
	});

	const captchaAnswer = await captcha.solve(captchaSrc);
	await page.evaluate(
		(_login, _password, _captcha) => {
			document.querySelector('#edit-name').value = _login;
			document.querySelector('#edit-pass').value = _password;
			document.querySelector('#edit-captcha-response').value = _captcha;
		},
		login,
		password,
		captchaAnswer,
	);

	const loginNavigationPromise = page.waitForNavigation();
	await page.click('#edit-submit');
	await loginNavigationPromise;

	const captchaError = await page.evaluate(
		() => !!document.querySelector('#edit-captcha-response.error'),
	);

	if (!captchaError) {
		return;
	}

	await loginAction(page, captcha, login, password);
};

export default loginAction;
