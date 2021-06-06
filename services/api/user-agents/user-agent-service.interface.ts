export interface UserAgentServiceInterface {
	getRandomMany(count: number): Promise<string[]>;
	getRandom(): Promise<string>;
	countActive(): Promise<number>;
	setInactive(userAgent: string): Promise<void>;
	update(userAgents: string[]): Promise<void>;
}
