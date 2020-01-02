import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { plainToClass } from 'class-transformer';
import { RegistrationDto } from './dto/registration.dto';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { User } from '../users/user';
import { UserExistsException } from './user-exists.exception';
import { ConfigInterface } from '../../../config/config.interface';
import { AuthorizedResponseDto } from './dto/authorized-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginFailedException } from './login-failed.exception';

const algorithmIterations = 100;
const hashLength = 128;

@injectable()
export class AuthService {
	constructor(
		@injectModel(User) private readonly UserModel: ModelType<User>,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	createToken(user: User) {
		return jwt.sign(
			{
				email: user.email,
				id: user._id.toString(),
			},
			this.config.get('jwt.secret'),
		);
	}

	async register(registrationDto: RegistrationDto): Promise<AuthorizedResponseDto> {
		const usersCount = await this.UserModel.count({ email: registrationDto.email });
		if (usersCount > 0) {
			throw new UserExistsException(registrationDto.email);
		}

		const newUser = new this.UserModel();
		newUser.email = registrationDto.email;
		newUser.salt = crypto.randomBytes(hashLength).toString('base64');
		newUser.passwordHash = crypto
			.pbkdf2Sync(
				registrationDto.password,
				newUser.salt,
				algorithmIterations,
				hashLength,
				'sha1',
			)
			.toString();

		await newUser.save();
		const token = this.createToken(newUser);
		return plainToClass(AuthorizedResponseDto, { token, user: newUser.toObject() });
	}

	private checkPassword(user: User, password: string) {
		if (!password) {
			return false;
		}

		if (!user.passwordHash) {
			return false;
		}

		const hash = crypto.pbkdf2Sync(
			password,
			user.salt,
			algorithmIterations,
			hashLength,
			'sha1',
		);
		return hash.toString() === user.passwordHash;
	}

	async login(loginDto: LoginDto) {
		const user = await this.UserModel.findOne({ email: loginDto.email });
		if (!user) {
			throw new LoginFailedException(loginDto.email);
		}

		if (!this.checkPassword(user, loginDto.password)) {
			throw new LoginFailedException(loginDto.email);
		}

		const token = this.createToken(user);

		return plainToClass(AuthorizedResponseDto, { token, user: user.toObject() });
	}
}
