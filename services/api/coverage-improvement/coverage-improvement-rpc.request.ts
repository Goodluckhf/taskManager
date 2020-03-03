import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

type CoverageImprovementArgument = {
	userCredentials: VkUserCredentialsInterface;
	postLinks: string[];
};

export class CoverageImprovementRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'coverage_improvement';

	protected readonly retriesLimit = 1;

	setArguments(args: CoverageImprovementArgument) {
		this.args = args;
	}
}
