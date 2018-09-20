import taskSchema          from './Task';
import autoLikesTaskSchema from './TaskType/AutoLikes';
import likesCommonSchema   from './TaskType/LikesCommon';
import commentsTaskSchema  from './TaskType/Comments';
import likesTaskSchema     from './TaskType/LikesTask';

import groupSchema   from './Group';
import accountSchema from './Account';


// Initialise mongoose models
export default (connection) => {
	connection.model('Group', groupSchema);
	connection.model('Account', accountSchema);
	connection.model('Task', taskSchema);
	connection.model('Task').discriminator('AutoLikesTask', autoLikesTaskSchema);
	connection.model('Task').discriminator('LikesCommon', likesCommonSchema);
	connection.model('Task').discriminator('CommentsTask', commentsTaskSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
};
