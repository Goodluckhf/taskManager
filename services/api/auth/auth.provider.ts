import { interfaces } from 'inversify-express-utils';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { plainToClass } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { UnauthorizedPrincipal } from './unauthorized.principal';
import { ConfigInterface } from '../../../config/config.interface';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { User } from '../users/user';
import { AuthorizedPrincipal } from './authorized.principal';

@injectable()
export class AuthProvider implements interfaces.AuthProvider {
	constructor(
		@inject('Config') private readonly config: ConfigInterface,
		@injectModel(User) private readonly UserModel: ModelType<User>,
	) {}

	async getUser(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	): Promise<interfaces.Principal> {
		const token = req.headers.authorization || null;

		if (!token) {
			return new UnauthorizedPrincipal();
		}

		let decodedToken = null;
		try {
			decodedToken = jsonwebtoken.verify(token, this.config.get('jwt.secret'));
		} catch (e) {
			return new UnauthorizedPrincipal();
		}

		const user = await this.UserModel.findById(decodedToken.id);

		if (!user) {
			return new UnauthorizedPrincipal();
		}

		return new AuthorizedPrincipal(plainToClass(User, user.toObject()));
	}
}
