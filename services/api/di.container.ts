import 'reflect-metadata';
import { Container } from 'inversify';
import config from 'config';
import { ConfigInterface } from '../../config/config.interface';
import logger from '../../lib/logger';
import { LoggerInterface } from '../../lib/logger.interface';

const container = new Container({
	autoBindInjectable: true,
	defaultScope: 'Singleton',
});

container.bind<ConfigInterface>('Config').toConstantValue(config);
container.bind<LoggerInterface>('Logger').toConstantValue(logger);

export default container;
