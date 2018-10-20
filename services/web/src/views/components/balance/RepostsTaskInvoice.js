import React, { PureComponent } from 'react';
import propTypes                from 'prop-types';

class RepostsTaskInvoice extends PureComponent {
	static propTypes = {
		invoice     : propTypes.node,
		repostsCount: propTypes.number,
		postLink    : propTypes.string,
	};
	
	render() {
		return (
			<div>
				{this.props.invoice}
				<hr/>
				Задача накрутки репостов<br/>
				Кол-во: {this.props.repostsCount}
				Ссылка: <a rel='noopener noreferrer' target='_blank' href={this.props.postLink}>{this.props.postLink}</a>
			</div>
		);
	}
}

export default RepostsTaskInvoice;
