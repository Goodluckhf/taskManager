import { SessionTokenRpcResponseInterface } from '../vk-users/session-token-rpc-response.interface';

export class PostCommentResponse implements SessionTokenRpcResponseInterface {
	commentId: string;

	remixsid: string;
}
