import { interfaces } from 'inversify-express-utils';
import express from 'express';
import { User } from '../../users/user';
import { AuthorizedPrincipal } from '../../auth/authorized.principal';

export class AuthProviderMock implements interfaces.AuthProvider {
	private readonly user: User;

	constructor(user: User) {
		this.user = user;
	}

	async getUser(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	): Promise<interfaces.Principal> {
		return new AuthorizedPrincipal(this.user);
	}
}
