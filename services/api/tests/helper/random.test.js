import { expect } from 'chai';
import { getRandom, getRandomNumberString } from '../../../../lib/helper';


describe('Random helper', () => {
	describe('getRandom', () => {
		Array.from({ length: 5 }).forEach((_, i) => {
			it(`Should be gt ${i} and lt ${i + 10} #${i}`, () => {
				const random = getRandom(i, i + 10);
				expect(random >= i).to.be.true;
				expect(random <= i + 10).to.be.true;
			});
		});
		it('2 call should return different numbers', () => {
			expect(getRandom(0, 10)).to.be.not.equals(getRandom(0, 10));
		});
	});
	
	describe('getRandomNumberString', () => {
		Array.from({ length: 5 }).forEach((_, i) => {
			const length = i + 5;
			it(`Should be length of ${length} #${i}`, () => {
				const random = getRandomNumberString(length);
				expect(random.length).to.be.equals(length);
			});
		});
		
		it('2 call should return different string', () => {
			expect(getRandomNumberString(10)).to.be.not.equals(getRandomNumberString(10));
		});
	});
});
