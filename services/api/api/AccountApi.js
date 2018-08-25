import mongoose from 'mongoose';

import BaseApi          from './BaseApi';
import AccountRequest   from './amqpRequests/AccountRequest';
import { TaskApiError } from './errors';

/**
 * @property {RpcClient} rpcClient
 */
class AccountApi extends BaseApi {
	constructor(rpcClient, ...args) {
		super(...args);
		this.rpcClient = rpcClient;
	}
	
	/**
	 * @param {Object} data
	 * @param {String} data.login
	 * @param {String} data.password
	 */
	async add(data) {
		this.validate({
			properties: {
				login   : { type: 'string' },
				password: { type: 'string' },
			},
			required: ['login', 'password'],
		}, data);
		
		const request = new AccountRequest(this.config, {
			login   : data.login,
			password: data.password,
		});
		
		const result = await this.rpcClient.call(request);
		if (result.error) {
			throw new TaskApiError(request, result.error);
		}
		
		const account = mongoose.model('Account').createInstance({
			link    : result.link,
			login   : data.login,
			password: data.password,
		});
		
		return account.save();
	}
}

export default AccountApi;
