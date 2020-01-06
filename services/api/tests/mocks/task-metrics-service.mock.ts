import { Mocked } from '../types';
import { TaskMetricsServiceInterface } from '../../metrics/task-metrics-service.interface';

export const taskMetricsServiceMock: Mocked<TaskMetricsServiceInterface> = {
	addDuration: jest.fn(),
	increaseError: jest.fn(),
	increaseSuccess: jest.fn(),
};
