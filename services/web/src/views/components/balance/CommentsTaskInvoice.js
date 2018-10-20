import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

class CommentsTaskInvoice extends PureComponent {
	static propTypes = {
		invoice      : propTypes.node,
		commentsCount: propTypes.number,
		postLink     : propTypes.string,
	};
	
	render() {
		return (
			<div>
				{this.props.invoice}
				<hr/>
				Задача накрутки комментов<br/>
				Кол-во: {this.props.commentsCount}
				Ссылка: <a rel='noopener noreferrer' target='_blank' href={this.props.postLink}>{this.props.postLink}</a>
			</div>
		);
	}
}

export default CommentsTaskInvoice;
