import 'reflect-metadata';
import { CommentsTranslitReplacer } from './comments-translit-replacer';

describe('Транслитерация', () => {
	let ctx: {
		commentsTranslitReplacer: CommentsTranslitReplacer;
	};

	beforeEach(() => {
		ctx = { commentsTranslitReplacer: new CommentsTranslitReplacer() };
	});

	it('Ссылка вконце', () => {
		const link = 'http://vk.cc/asda';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут Просто супер ${link}`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут Просто супер ${link}`);
		expect(translited).toMatch(link);
	});

	it('Ссылка вначале', () => {
		const link = 'http://vk.cc/asda';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`${link} Крутая шутка заказывала тут Просто супер`,
		);
		expect(translited).not.toBe(`${link} Крутая шутка заказывала тут Просто супер`);
		expect(translited).toMatch(link);
	});

	it('Ссылка в центре', () => {
		const link = 'http://vk.cc/asda';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут ${link} Просто супер`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут ${link} Просто супер`);
		expect(translited).toMatch(link);
	});

	it('GET параметры', () => {
		const link = 'http://vk.cc/asda?a=123&v=2';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут ${link}`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут ${link}`);
		expect(translited).toMatch(link);
	});

	it('Без протокола', () => {
		const link = 'vk.cc/asda?a=123&v=2';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут ${link}`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут ${link}`);
		expect(translited).toMatch(link);
	});

	it('С поддоменом', () => {
		const link = 'test.vk.cc/asda?a=123&v=2';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут ${link}`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут ${link}`);
		expect(translited).toMatch(link);
	});

	it('С поддоменом и протоколом', () => {
		const link = 'htpp://test-askkkka.vk.cc/asda?a=123&v=2';
		const translited = ctx.commentsTranslitReplacer.randomReplace(
			`Крутая шутка заказывала тут ${link}`,
		);
		expect(translited).not.toBe(`Крутая шутка заказывала тут ${link}`);
		expect(translited).toMatch(link);
	});
});
