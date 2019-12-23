import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { random } from 'lodash';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { Proxy } from './proxy';

@injectable()
export class ProxyService {
	constructor(@injectModel(Proxy) private readonly ProxyModel: ModelType<Proxy>) {}

	async countActive(): Promise<number> {
		return this.ProxyModel.count({ isActive: true });
	}

	async getRandom(): Promise<Proxy> {
		const proxies = await this.ProxyModel.find({ isActive: true })
			.lean()
			.exec();

		return proxies[random(0, proxies.length - 1)];
	}

	async setInactive(url: string, reason: any) {
		const proxy = await this.ProxyModel.findOne({ url });
		proxy.isActive = false;
		proxy.errorComment = reason;
		await proxy.save();
	}
}
