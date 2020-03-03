import { IsDefined, IsEnum, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CommentByStrategyTaskInterface } from '../comment-by-strategy-task.interface';
import { CommentStrategyInterface } from '../comment-strategy.interface';
import { CommentStrategyDto } from './comment-strategy.dto';
import { tagsEnum } from '../../vk-users/tags-enum.constant';

export class TaskCreationDto implements CommentByStrategyTaskInterface {
	@Type(() => CommentStrategyDto)
	@IsDefined()
	commentsStrategy: CommentStrategyInterface[];

	@IsString()
	@MinLength(1)
	postLink: string;

	@IsEnum(tagsEnum, { each: true })
	userTags: tagsEnum[];
}
