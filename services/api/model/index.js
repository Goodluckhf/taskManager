import taskSchema from './Task';
import likesTaskSchema from './TaskType/Likes';

import groupSchema from './Group';


// Initialise mongoose models
export default (connection) => {
	connection.model('Task', taskSchema);
	connection.model('Group', groupSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
};
