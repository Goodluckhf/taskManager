import { Mocked } from '../types';
import { VkUserBanMetricsInterface } from '../../metrics/vk-user-ban-metrics.interface';

export const vkUserBanMetricServiceMock: Mocked<VkUserBanMetricsInterface> = {
	increaseBannedBot: jest.fn(),
};
