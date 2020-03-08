import { IsEnum } from 'class-validator';
import { tagsEnum } from '../vk-users/tags-enum.constant';

export class CreationForAllDto {
	@IsEnum(tagsEnum, { each: true })
	tags: tagsEnum[];
}
