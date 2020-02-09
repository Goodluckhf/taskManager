type LogMessage = string | object;

export interface LoggerInterface {
	info(msg: LogMessage): void;
	warn(msg: LogMessage): void;
	error(msg: LogMessage): void;
	child(args: object): LoggerInterface;
}
