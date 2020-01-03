export type Mocked<T> = {
	[P in keyof T]: jest.MockInstance<any, any> & T[P];
};
