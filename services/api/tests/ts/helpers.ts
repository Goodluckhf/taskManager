export const generateRandomString = () => {
	return Math.random()
		.toString()
		.replace('.', '-');
};
