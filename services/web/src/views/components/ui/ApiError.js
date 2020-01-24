import React, { PureComponent } from 'react';
import Immutable from 'immutable';
import propTypes from 'prop-types';
import { Alert } from 'reactstrap';

class ApiError extends PureComponent {
	static propTypes = {
		error: propTypes.oneOfType([propTypes.object, propTypes.instanceOf(Immutable.Map)])
			.isRequired,
		title: propTypes.string,
	};

	render() {
		let title;
		let error;
		if (this.props.error instanceof Immutable.Map) {
			error = this.props.error.get('formattedMessage');
			const _title = this.props.title;
			const message =
				this.props.error.get('message') ||
				this.props.error.getIn(['originalError', 'message']) ||
				'';
			title = _title ? `${_title}: ${message}` : message;

			const text = this.props.error.getIn(['task', 'text']);
			if (text) {
				error = `${error}\nКомментарий: ["${text}"]`;
			}
		} else {
			error = this.props.error.description || '';
			const { message } = this.props.error;
			title = this.props.title ? `${this.props.title}: ${message}` : message;
		}
		return (
			<Alert color="danger" {...this.props}>
				<h4 className="alert-heading">{title}!</h4>
				<pre>{error}</pre>
			</Alert>
		);
	}
}

export default ApiError;
