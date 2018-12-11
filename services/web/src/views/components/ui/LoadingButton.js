import React, { PureComponent } from 'react';
import * as Ladda from 'ladda';
import 'ladda/dist/ladda.min.css';

import propTypes from 'prop-types';

export const XS = 'xs';
export const S = 's';
export const L = 'l';
export const XL = 'xl';

export const SIZES = [XS, S, L, XL];

class LoadingButton extends PureComponent {
	static propTypes = {
		loading: propTypes.bool.isRequired,
		style: propTypes.object,
		disabled: propTypes.bool,
		children: propTypes.node,
		onClick: propTypes.func,
		'data-size': propTypes.oneOf(SIZES),
		'data-color': propTypes.oneOf(['green', 'red', 'blue', 'purple', 'mint']),
	};

	static defaultProps = {
		disabled: false,
	};

	componentDidMount() {
		this.laddaInstance = Ladda.create(this.node);
		if (this.props.loading) {
			this.laddaInstance.start();
		}
	}

	componentDidUpdate() {
		if (this.props.loading) {
			this.laddaInstance.start();
		} else {
			this.laddaInstance.stop();
		}
	}

	setNode = node => {
		this.node = node;
	};

	componentWillUnmount() {
		this.laddaInstance.remove();
	}

	render() {
		return (
			<button
				ref={this.setNode}
				style={this.props.style}
				disabled={this.props.disabled}
				onClick={this.props.onClick}
				className="ladda-button"
				data-style="zoom-in"
				data-size={this.props['data-size']}
				data-color={this.props['data-color']}>
				<span className="ladda-label">{this.props.children}</span>
			</button>
		);
	}
}

export default LoadingButton;
