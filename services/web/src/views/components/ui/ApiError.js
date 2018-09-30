import React, { PureComponent } from 'react';
import Immutable                from 'immutable';
import propTypes from 'prop-types';
import { Alert } from 'reactstrap';

class ApiError extends PureComponent {
	static propTypes = {
		error: propTypes.instanceOf(Immutable.Map).isRequired,
		title: propTypes.string,
	};
	
	render() {
		const message = this.props.error instanceof Immutable.Map
			? this.props.error.get('message')
			: this.props.error.message;
		
		const title   = this.props.title ? `${this.props.title}: ${message}` : message;
		return (
			<Alert color="danger" {...this.props}>
				<h4 className="alert-heading">{title}!</h4>
				<pre>{JSON.stringify(this.props.error, null, 2)}</pre>
			</Alert>
		);
	}
}

export default ApiError;
