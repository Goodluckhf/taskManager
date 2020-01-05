import { IsDefined, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CommentByStrategyTaskInterface } from '../comment-by-strategy-task.interface';
import { CommentStrategyInterface } from '../comment-strategy.interface';
import { CommentStrategyDto } from './comment-strategy.dto';

export class TaskCreationDto implements CommentByStrategyTaskInterface {
	@Type(() => CommentStrategyDto)
	@IsDefined()
	commentsStrategy: CommentStrategyInterface[];

	@IsString()
	postLink: string;
}
