import { inject, injectable } from 'inversify';
import { ConfigInterface } from '../../config/config.interface';
import { ClassType } from '../internal.types';
import { AbstractRpcRequest } from './abstract-rpc-request';

@injectable()
export class RpcRequestFactory {
	constructor(@inject('Config') private readonly config: ConfigInterface) {}

	create<T extends AbstractRpcRequest>(RequestClass: ClassType<T>): T {
		const rpcRequest = new RequestClass();
		rpcRequest
			.setQueue(this.config.get('tasksQueue.name'))
			.setTimeout(this.config.get('tasksQueue.timeout'));

		return rpcRequest;
	}
}
