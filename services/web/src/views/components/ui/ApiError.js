import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Alert } from 'reactstrap';

class ApiError extends PureComponent {
	static propTypes = {
		error: propTypes.string.object,
	};
	
	render() {
		const { message } = this.props.error;
		return (
			<Alert color="danger" {...this.props}>
				<h4 className="alert-heading">{message}!</h4>
				<pre>{JSON.stringify(this.props.error, null, 2)}</pre>
			</Alert>
		);
	}
}

export default ApiError;
