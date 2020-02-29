import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

export interface CommentComplainRpcArgsInterface {
	postLink: string;
	userCredentials: VkUserCredentialsInterface;
}
