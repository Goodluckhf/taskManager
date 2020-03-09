import { inject, injectable } from 'inversify';
import { UMetrics } from 'umetrics';
import { UmetricsWrapper } from './umetrics-wrapper';

@injectable()
export class TaskMetricsService {
	private readonly uMetrics: UMetrics;

	constructor(@inject(UmetricsWrapper) private readonly uMetricsWrapper: UmetricsWrapper) {
		this.uMetrics = this.uMetricsWrapper.getUMetrics();

		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'taskSuccessCount', {
			labels: ['task_type'],
		});

		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'taskErrorCount', {
			labels: ['task_type'],
		});

		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'taskDuration', {
			labels: ['task_type'],
		});

		this.uMetrics.register(this.uMetrics.Metrics.Gauge, 'taskCount', {
			labels: ['task_type'],
		});
	}

	increaseSuccess(taskType: string) {
		this.uMetrics.taskSuccessCount.inc(1, { task_type: taskType });
	}

	addDuration(taskType: string, duration: number) {
		this.uMetrics.taskDuration.inc(duration, { task_type: taskType });
		this.uMetrics.taskCount.inc(1, { task_type: taskType });
	}

	increaseError(taskType: string) {
		this.uMetrics.taskErrorCount.inc(1, { task_type: taskType });
	}
}
