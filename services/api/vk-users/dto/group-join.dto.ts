import { IsDefined, IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { tagsEnum } from '../tags-enum.constant';

export class GroupJoinDto {
	@IsString()
	groupId: string;

	@IsDefined()
	userTags: tagsEnum[];

	@Transform(value => {
		const intVal = parseInt(value, 10);
		// eslint-disable-next-line no-restricted-globals
		if (isFinite(intVal)) {
			return intVal;
		}

		return null;
	})
	@IsInt()
	maxDistribution: number;
}
