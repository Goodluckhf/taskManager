import taskSchema from './Task';
import likesTaskSchema from './TaskType/Likes';

import publicSchema from './Public';


// Initialise mongoose models
export default (connection) => {
	connection.model('Task', taskSchema);
	connection.model('Public', publicSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
};
