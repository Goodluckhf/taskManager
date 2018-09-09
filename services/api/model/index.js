import taskSchema          from './Task';
import autoLikesTaskSchema from './TaskType/AutoLikes';
import likesTaskSchema     from './TaskType/Likes';

import groupSchema   from './Group';
import accountSchema from './Account';


// Initialise mongoose models
export default (connection) => {
	connection.model('Group', groupSchema);
	connection.model('Account', accountSchema);
	connection.model('Task', taskSchema);
	connection.model('Task').discriminator('AutoLikesTask', autoLikesTaskSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
};
