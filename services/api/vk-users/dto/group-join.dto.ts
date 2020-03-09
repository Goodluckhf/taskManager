import { IsDefined, IsString } from 'class-validator';
import { tagsEnum } from '../tags-enum.constant';

export class GroupJoinDto {
	@IsString()
	groupId: string;

	@IsDefined()
	tags: tagsEnum[];
}
