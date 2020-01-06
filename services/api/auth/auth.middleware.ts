import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { AccessDeniedException } from './access-denied.exception';
import { User } from '../users/user';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
	async handler(req: Request, res: Response, next: NextFunction) {
		const { user: principal } = this.httpContext;
		const user = principal.details as User;
		if (!(await principal.isAuthenticated())) {
			res.status(401).send();
			return;
		}

		if (!(await principal.isInRole('premium'))) {
			next(new AccessDeniedException(user._id.toString(), req));
			return;
		}

		next();
	}
}
