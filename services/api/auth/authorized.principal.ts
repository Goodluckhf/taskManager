import { interfaces } from 'inversify-express-utils';
import { User } from '../users/user';
import { Roles } from '../users/roles.constant';

export class AuthorizedPrincipal implements interfaces.Principal {
	public constructor(user: User) {
		this.details = user;
	}

	async isAuthenticated(): Promise<boolean> {
		return true;
	}

	async isInRole(role: string): Promise<boolean> {
		return this.details.role === Roles[role] || this.details.role === Roles.admin;
	}

	async isResourceOwner(resourceId: any): Promise<boolean> {
		return false;
	}

	details: User;
}
