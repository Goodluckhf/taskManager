export enum statuses {
	// Ожидает взятия в работу
	waiting = 'waiting',

	// Выполняется
	pending = 'pending',

	// Задача завершена
	finished = 'finished',

	// Прорущена
	skipped = 'skipped',

	// Проверяется
	checking = 'checking',
}
