type classType = {
	new (...args: any[]): any;
};

export const getModelToken = (modelClass: classType) => {
	return `${modelClass.name}_model`;
};
