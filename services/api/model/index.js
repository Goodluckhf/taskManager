import taskSchema from './Task';
import autoLikesTaskSchema from './TaskType/AutoLikes';
import likesCommonSchema from './TaskType/LikesCommon';
import likesTaskSchema from './TaskType/LikesTask';
import commentsCommonSchema from './TaskType/CommentsCommon';
import commentsTaskSchema from './TaskType/CommentsTask';
import likesCheckTaskSchema from './TaskType/LikesCheckTask';
import commentsCheckTaskSchema from './TaskType/CommentsCheckTask';
import repostsCheckTaskSchema from './TaskType/RepostsCheckTask';
import repostsCommonSchema from './TaskType/RepostsCommon';
import repostsTaskSchema from './TaskType/RepostsTask';
import checkWallBanTaskSchema from './TaskType/CheckWallBanTask';
import checkBalanceTaskSchema from './TaskType/CheckBalanceTask';

import groupSchema from './Group';
import accountSchema from './Account';
import userSchema from './User';
import invoiceSchema from './Invoice';
import accountUserSchema from './UserType/AccountUser';
import premiumUserSchema from './UserType/PremiumUser';
import topUpInvoiceSchema from './InvoiceType/Topup';
import taskInvoiceSchema from './InvoiceType/Task';
import adminSchema from './UserType/AdminUser';
import commentsByStrategyTaskSchema from './TaskType/CommentsByStrategyTask';

// Initialise mongoose models
export default connection => {
	connection.model('Group', groupSchema);
	connection.model('Account', accountSchema);
	connection.model('User', userSchema);
	connection.model('User').discriminator('AccountUser', accountUserSchema);
	connection.model('User').discriminator('PremiumUser', premiumUserSchema);
	connection.model('User').discriminator('AdminUser', adminSchema);

	connection.model('Invoice', invoiceSchema);
	connection.model('Invoice').discriminator('TopUpInvoice', topUpInvoiceSchema);
	connection.model('Invoice').discriminator('TaskInvoice', taskInvoiceSchema);

	connection.model('Task', taskSchema);
	connection.model('Task').discriminator('AutoLikesTask', autoLikesTaskSchema);
	connection.model('Task').discriminator('LikesCommon', likesCommonSchema);
	connection.model('Task').discriminator('LikesTask', likesTaskSchema);
	connection.model('Task').discriminator('LikesCheckTask', likesCheckTaskSchema);
	connection.model('Task').discriminator('CommentsCheckTask', commentsCheckTaskSchema);
	connection.model('Task').discriminator('CommentsCommon', commentsCommonSchema);
	connection.model('Task').discriminator('CommentsTask', commentsTaskSchema);
	connection.model('Task').discriminator('RepostsCheckTask', repostsCheckTaskSchema);
	connection.model('Task').discriminator('RepostsCommon', repostsCommonSchema);
	connection.model('Task').discriminator('RepostsTask', repostsTaskSchema);
	connection.model('Task').discriminator('CheckWallBanTask', checkWallBanTaskSchema);
	connection.model('Task').discriminator('CheckBalanceTask', checkBalanceTaskSchema);

	connection.model('Task').discriminator('CommentsByStrategyTask', commentsByStrategyTaskSchema);
};
