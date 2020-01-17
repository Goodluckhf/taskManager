import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

export interface GroupJoinTaskInterface {
	vkUserCredentials: VkUserCredentialsInterface;
	groupId: string;
}
