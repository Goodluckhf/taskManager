export default async (page, { login, password }) => {
	await page.goto('https://likepro.org/', { waitUntil: 'networkidle2' });
	await page.evaluate((_login, _password) => {
		document.querySelector('.s__auth-login input[name="login"]').value = _login;
		document.querySelector('.s__auth-login input[name="password"]').value  = _password;
	}, login, password);
	
	const navigationPromise = page.waitForNavigation();
	await page.click('.s__auth-login button[type="submit"]');
	return navigationPromise;
};
