import taskSchema              from './Task';
import autoLikesTaskSchema     from './TaskType/AutoLikes';
import likesCommonSchema       from './TaskType/LikesCommon';
import likesTaskSchema         from './TaskType/LikesTask';
import commentsCommonSchema    from './TaskType/CommentsCommon';
import commentsTaskSchema      from './TaskType/CommentsTask';
import likesCheckTaskSchema    from './TaskType/LikesCheckTask';
import commentsCheckTaskSchema from './TaskType/CommentsCheckTask';
import checkWallBanTaskSchema  from './TaskType/CheckWallBanTask';

import groupSchema                from './Group';
import accountSchema              from './Account';


// Initialise mongoose models
export default (connection) => {
	connection.model('Group', groupSchema);
	connection.model('Account', accountSchema);
	connection.model('Task', taskSchema);
	connection.model('Task').discriminator('AutoLikesTask', autoLikesTaskSchema);
	connection.model('Task').discriminator('LikesCommon', likesCommonSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
	connection.model('Task').discriminator('LikesCheckTask', likesCheckTaskSchema);
	connection.model('Task').discriminator('CommentsCheckTask', commentsCheckTaskSchema);
	connection.model('Task').discriminator('CommentsCommon', commentsCommonSchema);
	connection.model('Task').discriminator('CommentsTask', commentsTaskSchema);
	connection.model('Task').discriminator('CheckWallBanTask', checkWallBanTaskSchema);
};
