export interface PostCommentArgInterface {
	credentials: {
		login: string;
		password: string;
		remixsid: string;
		userAgent: string;
		proxy: {
			url: string;
			login: string;
			password: string;
		};
	};

	postLink: string;

	text: string;

	imageURL: string;

	replyTo: string;
}
