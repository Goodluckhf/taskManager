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
	
	it('Should clean if there is away.php', () => {
		const url = 'https://vk.com/away.php?to=https%3A%2F%2Fgithub.com%2Fsearch%3Futf8%3D%25E2%259C%2593%26q%3Dasdasd%26type%3D&post=-148143523_3186&cc_key=';
		const cleaned = cleanLink(url);
		expect(cleaned).to.be.equals('github.com/search?utf8=✓&q=asdasd&type=');
	});
	
	it('should clean "/" if there is away.php', () => {
		const url = 'https://vk.com/away.php?to=https%3A%2F%2Fgithub.com%2Fsearch%2F&post=-148143523_3186&cc_key=';
		const cleaned = cleanLink(url);
		expect(cleaned).to.be.equals('github.com/search');
	});
	
	it('should clean "?" if there is away.php', () => {
		const url = 'https://vk.com/away.php?to=https%3A%2F%2Fgithub.com%2Fsearch%3F&post=-148143523_3186&cc_key=';
		const cleaned = cleanLink(url);
		expect(cleaned).to.be.equals('github.com/search');
	});
});
