import moment from 'moment';
import clc    from 'cli-color';

const colorConfig = {
	date: date => clc.blackBright(date),
	
	// info
	30: {
		level : clc.bgBlue('i'),
		source: source => clc.blue(source),
	},
	
	// warning
	40: {
		level : clc.bgYellow('w'),
		source: source => clc.yellow(source),
	},
	
	// error
	50: {
		level : clc.bgRed('e'),
		source: source => clc.red(source),
	},
	
	object: {
		//Отступ для многострочных (вида "\n| ") С чередованием цвета вертикальной черты
		indent: (count = 1, isEOL = true) => {
			const line = count % 2 !== 0 ? '|' : '¦';
			return isEOL ? `\n${line} ` : `${line} `;
		},
		
		//Цвет ключа объекта с чередованием цвета
		key: key => clc.cyan(key),
		
		//Системный тип данных
		system: val => clc.yellowBright(val),
	},
};

const bunyanDefaultKeys = ['name', 'hostname', 'pid', 'v', 'time', 'msg', 'level', 'message'];

const workDir = `${process.cwd()}/`;

const buildIndentString = (count) => {
	const indentString = Array.from({ length: count - 1 }).reduce((str, _, key) => {
		return `${str}${colorConfig.object.indent(key, false)}`;
	}, '');
	
	return `${colorConfig.object.indent()}${indentString}`;
};

const formatOptionLine = (data) => {
	const timeString = moment(data.time).format('MM.DD HH:mm:ss');
	const source =
			(((new Error().stack)
				.split(/\n\s*[at]*\s*/g))[5])
				.replace(workDir, '')
				.match(/\(?(\S*:\d+:\d+)\)?/)[1];
	
	return  `${colorConfig[data.level].level} ` + // Log level
			`${colorConfig.date(timeString)} ` + // Time
			`${colorConfig[data.level].source(source)} ` + // Path source
			`${data.msg || data.message || ''}`;
};

const formatErrorStack = (stack, depth) => {
	const stackArray = stack.split('\n').slice(1).map((stackItem) => {
		return stackItem
			.replace(workDir, './')
			.replace(/^\s*/, `${buildIndentString(depth + 1)}${colorConfig.object.indent(0, false)}`);
	});
	return stackArray.join('');
};

const formatError = (error, depth) => {
	// eslint-disable-next-line no-use-before-define
	const keyValuesString = formatObject({
		message: error.message,
		...error,
	}, depth);
	
	return  `${keyValuesString}` +
			`${buildIndentString(depth + 1)}` +
			`${colorConfig.object.key('stack', 1)}: ${formatErrorStack(error.stack, depth)}`;
};


const formatArray = (array) => {
	const arrayString = array.map((item) => {
		if (typeof item === 'object') {
			return colorConfig.object.system('Object');
		}
		
		return item;
	});
	
	return `[${arrayString.join(', ')}]`;
};

const formatObject = (object, depth = 0) => {
	return Object.keys(object).reduce((str, key) => {
		const value = object[key];
		let displayString = '';
		if (Array.isArray(value)) {
			displayString = formatArray(value);
		} else if (value instanceof Error) {
			displayString = formatError(value, depth + 1);
		} else if (typeof value === 'object') {
			displayString = formatObject(value, depth + 1);
		}  else {
			displayString = value;
		}
		
		const indentString = buildIndentString(depth + 1);
		
		return `${str}${indentString}${colorConfig.object.key(key, 1)}: ${displayString}`;
	}, '');
};

// Remove default bunyan keys from object
const excludeDefaultKeys = (object) => {
	return Object.keys(object).reduce((ob, key) => {
		if (bunyanDefaultKeys.includes(key)) {
			return ob;
		}
		
		return { ...ob, [key]: object[key] };
	}, {});
};


export default class StdoutStream {
	constructor(stream) {
		this.stream = stream;
	}
	
	write(data) {
		const optionLine = formatOptionLine(data);
		this.stream.write(`${optionLine}`);
		const objectForDisplay = excludeDefaultKeys(data);
		
		this.stream.write(formatObject(objectForDisplay));
		this.stream.write('\n');
	}
}
