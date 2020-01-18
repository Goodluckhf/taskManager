export class AccountException extends Error {
	public code: string;

	public login: string;

	public canRetry: boolean;

	constructor(message: string, code: string, login: string, canRetry: boolean) {
		super(message);
		this.code = code;
		this.login = login;
		this.canRetry = canRetry;
	}
}
