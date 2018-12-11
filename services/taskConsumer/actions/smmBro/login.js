const loginAction = async (page, { login, password }) => {
	const loginPageResponse = await page.goto('https://smmbro.su/login', {
		waitUntil: 'networkidle2',
	});

	if (loginPageResponse.status() !== 200) {
		throw new Error('Сервис не доступен');
	}

	await page.evaluate(
		(_login, _password) => {
			document.querySelector('#email').value = _login;
			document.querySelector('#password').value = _password;
		},
		login,
		password,
	);

	const loginNavigationPromise = page.waitForNavigation();
	await page.click('button[type="submit"]');
	await loginNavigationPromise;

	await page.waitForFunction(() => {
		const preloader = document.querySelector('#preloader');
		return preloader.style.display === 'none';
	});
};

export default loginAction;
