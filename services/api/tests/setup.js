import chai from 'chai';
import chaiAsPromised    from 'chai-as-promised';
import { Mockgoose } from 'mockgoose';
import mongoose      from '../../../lib/mongoose';
import initModels    from '../model';

chai.use(chaiAsPromised);
let mockgoose;
before(async function () {
	this.timeout(60000);
	mockgoose = new Mockgoose(mongoose);
	mockgoose.helper.setDbVersion('3.4.5');
	await mockgoose.prepareStorage();
	await mongoose.connect('mongodb://localhost/testDatabase');
	//mongoose.connection.models = {};
	initModels(mongoose.connection);
});

beforeEach(async () => {
	await mockgoose.helper.reset();
});

