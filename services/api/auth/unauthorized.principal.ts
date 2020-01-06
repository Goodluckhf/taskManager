import { interfaces } from 'inversify-express-utils';

export class UnauthorizedPrincipal implements interfaces.Principal {
	details = {};

	async isAuthenticated(): Promise<boolean> {
		return false;
	}

	async isInRole(role: string): Promise<boolean> {
		return false;
	}

	async isResourceOwner(resourceId: any): Promise<boolean> {
		return true;
	}
}
