export class CommentsClosedException extends Error {
	public code = 'comments_closed';

	public canRetry = false;

	public login: string;

	public postLink: string;

	constructor(login: string, postLink: string) {
		super('Комментарии у поста закрыты или включены фильтры');
		this.login = login;
		this.postLink = postLink;
	}
}
