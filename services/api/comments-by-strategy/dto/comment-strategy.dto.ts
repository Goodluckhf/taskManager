import { IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CommentStrategyInterface } from '../comment-strategy.interface';

export class CommentStrategyDto implements CommentStrategyInterface {
	@IsString()
	imageURL: string;

	@Transform(value => parseInt(value, 10))
	@IsInt()
	likesCount: number;

	@Transform(value => {
		const intVal = parseInt(value, 10);
		// eslint-disable-next-line no-restricted-globals
		if (isFinite(intVal)) {
			return intVal;
		}

		return null;
	})
	@IsInt()
	replyToCommentNumber: number;

	@IsString()
	text: string;

	@Transform(value => parseInt(value, 10))
	@IsInt()
	userFakeId: number;
}
