import { BaseHttpController, controller, httpPost, requestBody } from 'inversify-express-utils';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { inject } from 'inversify';
import { RegistrationDto } from './dto/registration.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@controller('/api/auth')
export class AuthController extends BaseHttpController {
	@inject(AuthService) private readonly authService: AuthService;

	@httpPost('/register')
	async register(@requestBody() body) {
		const registrationDto = plainToClass(RegistrationDto, body);
		const errors = validateSync(registrationDto);
		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{ success: true, data: await this.authService.register(registrationDto) },
			200,
		);
	}

	@httpPost('/login')
	async login(@requestBody() body) {
		const loginDto = plainToClass(LoginDto, body);
		const errors = validateSync(loginDto);
		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json({ success: true, data: await this.authService.login(loginDto) }, 200);
	}
}
