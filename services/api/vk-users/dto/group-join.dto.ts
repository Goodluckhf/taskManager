import { IsString } from 'class-validator';

export class GroupJoinDto {
	@IsString()
	groupId: string;
}
