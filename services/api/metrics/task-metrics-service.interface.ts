export interface TaskMetricsServiceInterface {
	increaseSuccess(taskType: string);

	addDuration(taskType: string, duration: number);

	increaseError(taskType: string);
}
