import { getRandom } from '../../../lib/helper';
import { injectable } from 'inversify';

const alphabetMapper = {
	a: 'а',
	А: 'A',
	В: 'B',
	У: 'Y',
	О: 'O',
	Р: 'P',
	С: 'C',
	C: 'С',
	M: 'М',
	М: 'M',
	Т: 'T',
	T: 'Т',
	E: 'Е',
	Е: 'E',
	H: 'Н',
	Н: 'H',
	K: 'К',
	К: 'K',
	а: 'a',
	e: 'е',
	е: 'e',
	y: 'у',
	у: 'y',
	и: 'u',
	o: 'о',
	о: 'o',
	p: 'р',
	р: 'p',
	k: 'к',
	к: 'k',
	х: 'x',
	x: 'х',
	с: 'c',
	c: 'с',
};

@injectable()
export class CommentsTranslitReplacer {
	private replaceText(text: string): string {
		return [...text]
			.map(char => {
				const random = getRandom(0, 100);
				if (random > 50) {
					return char;
				}

				const transiltChar = alphabetMapper[char];
				if (!transiltChar) {
					return char;
				}

				return transiltChar;
			})
			.join('');
	}

	randomReplace(originalText: string): string {
		const link = originalText.match(/(https?:\/\/)?[^\s]+\.[^\s]+/gi);
		if (link && link.length === 1) {
			const textParts = originalText.split(link[0]);
			const replacedParts = textParts.map(part => this.replaceText(part));
			return `${replacedParts[0]}${link}${replacedParts[1]}`;
		}

		if (link && link.length > 1) {
			return originalText;
		}

		return this.replaceText(originalText);
	}
}
