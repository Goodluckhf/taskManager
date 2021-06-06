import { IsDefined, IsString } from 'class-validator';

export class UserAgentsDto {
	@IsDefined()
	@IsString({ each: true })
	userAgents: string[];
}
