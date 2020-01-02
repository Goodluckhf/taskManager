import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types';
import { User } from '../../../users/user';
import { generateRandomString } from '../helpers';
import { Roles } from '../../../users/roles.constant';

export async function createUser(
	UserModel: ModelType<User>,
	opts: Partial<User> = {},
): Promise<DocumentType<User>> {
	const user = new UserModel(opts);
	user.email = opts.email || generateRandomString();
	user.passwordHash = generateRandomString();
	user.role = opts.role || Roles.premium;
	await user.save();
	return user;
}
