import { expect } from 'chai';
import { cleanLink } from '../../../../lib/helper';

describe('cleanLink', () => {
	it('Should decode uri', () => {
		const url = 'github.com/search?utf8=%E2%9C%93&q=asdasd&type=';
		const cleanedLink = cleanLink(url);
		expect(cleanedLink).to.be.equals('github.com/search?utf8=✓&q=asdasd&type=');
	});
	
	it('Should remove protocol "http"', () => {
		const url = 'http://github.com/search';
		const cleanedLink = cleanLink(url);
		expect(cleanedLink).to.be.equals('github.com/search');
	});
	
	it('Should remove protocol "https"', () => {
		const url = 'https://github.com/search';
		const cleanedLink = cleanLink(url);
		expect(cleanedLink).to.be.equals('github.com/search');
	});
	
	it('Should remove "/" at the end on link', () => {
		const url = 'https://github.com/search/';
		const cleanedLink = cleanLink(url);
		expect(cleanedLink).to.be.equals('github.com/search');
	});
	
	it('Should remove "?" at the end if there is not params', () => {
		const url = 'https://github.com/search?';
		const cleanedLink = cleanLink(url);
		expect(cleanedLink).to.be.equals('github.com/search');
	});
});
