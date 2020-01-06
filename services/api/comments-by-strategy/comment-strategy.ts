import { prop } from '@typegoose/typegoose';
import { CommentStrategyInterface } from './comment-strategy.interface';

export class CommentStrategy implements CommentStrategyInterface {
	@prop({ required: true })
	userFakeId: number;

	@prop()
	replyToCommentNumber: number;

	@prop({ required: true })
	text: string;

	@prop()
	imageURL: string;

	@prop({ default: 0 })
	likesCount: number;
}
