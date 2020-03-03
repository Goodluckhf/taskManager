import { CommentStrategy } from './comment-strategy';
import { tagsEnum } from '../vk-users/tags-enum.constant';

export interface CommentByStrategyTaskInterface {
	postLink: string;

	commentsStrategy: CommentStrategy[];

	userTags: tagsEnum[];
}
