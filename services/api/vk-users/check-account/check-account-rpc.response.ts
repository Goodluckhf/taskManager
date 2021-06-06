import { Transform } from 'class-transformer';
import { SessionTokenRpcResponseInterface } from '../session-token-rpc-response.interface';

export class CheckAccountRpcResponse implements SessionTokenRpcResponseInterface {
	@Transform(value => !!value)
	isActive: boolean;

	code: string;

	remixsid: string;
}
