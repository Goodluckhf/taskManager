import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

export interface CommentComplainRpcArgsInterface {
	commentLink: string;
	userCredentials: VkUserCredentialsInterface;
}
