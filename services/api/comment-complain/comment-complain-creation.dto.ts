import { IsDefined, IsEnum, IsString, Matches } from 'class-validator';
import { tagsEnum } from '../vk-users/tags-enum.constant';

export class CommentComplainCreationDto {
	@IsString()
	@IsDefined()
	@Matches(/^https:\/\/vk.com\/wall-\d+_\d+/)
	postLink: string;

	@IsEnum(tagsEnum, { each: true })
	userTags: tagsEnum[];
}
