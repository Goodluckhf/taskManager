import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { inject, injectable } from 'inversify';
import { IMiddleware } from 'koa-router';
import { PassportStatic } from 'passport';
import { MiddlewareInterface } from '../../../lib/framework/middleware.interface';
import mongoose from '../../../lib/mongoose';
import { ConfigInterface } from '../../../config/config.interface';

@injectable()
export class AuthMiddleware implements MiddlewareInterface {
	constructor(
		@inject('Passport') private readonly passport: PassportStatic,
		@inject('Config') private readonly config: ConfigInterface,
	) {
		this.applyPassport();
	}

	applyPassport() {
		const jwtOptions = {
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromBodyField('jwt'),
				ExtractJwt.fromUrlQueryParameter('jwt'),
			]),
			secretOrKey: this.config.get('jwt.secret'),
		};

		this.passport.use(
			new JwtStrategy(jwtOptions, async (payload, done) => {
				try {
					const user = await mongoose.model('User').findById(payload.id);
					if (user) {
						done(null, user);
					} else {
						done(null, false);
					}
				} catch (error) {
					done(error);
				}
			}),
		);
	}

	getRawMiddleware(): IMiddleware {
		return this.passport.authenticate('jwt', { session: false });
	}
}
