export interface CallbackInterface {
	id: string;
	callback: Function;
	timeout: NodeJS.Timeout;
}
