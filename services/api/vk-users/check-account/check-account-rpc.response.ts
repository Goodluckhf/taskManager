import { Transform } from 'class-transformer';

export class CheckAccountRpcResponse {
	@Transform(value => !!value)
	isActive: boolean;

	code: string;

	remixsid: string;
}
