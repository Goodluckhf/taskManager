import { IsDefined, IsString, Matches } from 'class-validator';

export class CommentComplainCreationDto {
	@IsString()
	@IsDefined()
	@Matches(/^https:\/\/vk.com\/wall-\d+_\d+\?reply=\d+/)
	commentLink: string;
}
