export class JoinGroupFailedException extends Error {
	public groupLink: string;

	public login: string;

	public canRetry: boolean;

	public code: string;

	constructor(code: string, groupLink: string, login: string, canRetry = true) {
		super('Не смог вступить в группу');

		this.code = code;
		this.canRetry = canRetry;
		this.groupLink = groupLink;
		this.login = login;
	}
}
