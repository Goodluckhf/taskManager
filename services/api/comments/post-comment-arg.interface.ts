export interface PostCommentArgInterface {
	credentials: {
		login: string;
		password: string;
	};

	postLink: string;

	text: string;

	imageURL: string;

	replyTo: string;

	proxy: {
		url: string;
		login: string;
		password: string;
	};
}
