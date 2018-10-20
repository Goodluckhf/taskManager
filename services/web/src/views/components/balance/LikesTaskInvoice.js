import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

class LikesTaskInvoice extends PureComponent {
	static propTypes = {
		invoice   : propTypes.node,
		likesCount: propTypes.number,
		postLink  : propTypes.string,
	};
	
	render() {
		return (
			<div>
				{this.props.invoice}
				<hr/>
				Задача накрутки лайков<br/>
				Кол-во: {this.props.likesCount}
				Ссылка: <a rel='noopener noreferrer' target='_blank' href={this.props.postLink}>{this.props.postLink}</a>
			</div>
		);
	}
}

export default LikesTaskInvoice;
