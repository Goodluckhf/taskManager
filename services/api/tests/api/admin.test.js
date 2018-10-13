import { expect }                    from 'chai';
import config                        from 'config';
import mongoose                      from '../../../../lib/mongoose';
import AdminApi                      from '../../api/AdminApi';
import { NotFound, ValidationError } from '../../api/errors';

const loggerMock = { info() {}, error() {}, warn() {} };
describe('AdminApi', () => {
	it('Should throw error if user doesnt exists', async () => {
		const adminApi = new AdminApi(config, loggerMock);
		const userId   = mongoose.Types.ObjectId();
		await expect(adminApi.increaseBalance(userId, 10)).to.be.rejectedWith(NotFound);
	});
	
	it('Should throw validation error if quantity doesnt is not number', async () => {
		const adminApi = new AdminApi(config, loggerMock);
		const user = mongoose.model('AccountUser').createInstance({ email: 'asd', password: 'asd' });
		await user.save();
		
		await expect(adminApi.increaseBalance(user._id, null)).to.be.rejectedWith(ValidationError);
	});
	
	it('Should increase balance', async () => {
		const adminApi = new AdminApi(config, loggerMock);
		let user = mongoose.model('AccountUser').createInstance({ email: 'asd', password: 'asd' });
		await user.save();
		
		await expect(adminApi.increaseBalance(user._id, 10)).to.be.fulfilled;
		user = await mongoose.model('AccountUser').findById(user._id);
		expect(user.balance).to.be.equals(10);
	});
});
