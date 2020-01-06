import { CommentStrategy } from './comment-strategy';

export interface CommentByStrategyTaskInterface {
	postLink: string;

	commentsStrategy: CommentStrategy[];
}
