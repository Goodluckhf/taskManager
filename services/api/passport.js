import {
	ExtractJwt,
	Strategy as JwtStrategy,
}               from 'passport-jwt';
import mongoose from '../../lib/mongoose';

/**
 * @param {Passport} passport
 * @param {String} jwtSecret
 */
export default (passport, jwtSecret) => {
	const jwtOptions = {
		jwtFromRequest: ExtractJwt.fromExtractors([
			ExtractJwt.fromBodyField('jwt'),
			ExtractJwt.fromUrlQueryParameter('jwt'),
		]),
		secretOrKey: jwtSecret,
	};
	
	passport.use(new JwtStrategy(
		jwtOptions,
		async (payload, done) => {
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
		},
	));
};

