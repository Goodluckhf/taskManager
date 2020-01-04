import amqplib from 'amqplib';

export interface AmqpAdapterInterface {
	connect(): Promise<amqplib.Connection>;
}
