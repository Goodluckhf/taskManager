import logger       from '../logger';
import GracefulStop from './GracefulStop';

// Пока так. А вообще нужно переделать на IoC
export default new GracefulStop(logger);
