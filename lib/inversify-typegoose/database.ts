import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Mongoose } from 'mongoose';
import { ConfigInterface } from '../../config/config.interface';

type classType = {
	new (...args: any[]): any;
};

@injectable()
export class Database {
	constructor(
		@inject('Mongoose') private readonly mongoose: Mongoose,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	async connect() {
		return this.mongoose.connect(this.config.get('db.connectionURI'));
	}

	async disconnect() {
		return this.mongoose.disconnect();
	}
}
